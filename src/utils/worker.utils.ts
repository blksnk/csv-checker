/* eslint-disable @typescript-eslint/no-explicit-any */
import { clamp } from "@/utils/number.utils";
import {
  type GenericFn,
  type Logger as ILogger,
  type MaybeAsyncFn,
  type Nullable,
  type Optional,
} from "@ubloimmo/front-util";
import { Events } from "./event.utils";
import { Logger } from "./logger.utils";

export type WorkerFn<TData, TResult> = MaybeAsyncFn<[TData], TResult>;

export type WorkerTransformFn<TResult, TTransformedResult> = GenericFn<
  [TResult],
  TTransformedResult
>;

interface WorkerTaskBase<TData, TResult, TTransformed = TResult> {
  id: number;
  input: TData;
  transformFn?: WorkerTransformFn<TResult, TTransformed>;
  type: "task";
}

export interface WorkerTaskConverted<
  TData,
  TResult,
  TTransformed = TResult,
> extends WorkerTaskBase<TData, TResult, TTransformed> {
  kind: "converted";
  fn: WorkerFn<TData, TResult>;
  fnString: string;
  workerFnString: string;
}

export type WorkerTask<TData, TResult, TTransformed = TResult> =
  | WorkerTaskConverted<TData, TResult, TTransformed>
  | WorkerTaskCustom<TData, TResult, TTransformed>;

export interface WorkerTaskCustomClass {
  new (): Worker;
}

export interface WorkerTaskCustom<
  TData,
  TResult,
  TTransformed = TResult,
> extends WorkerTaskBase<TData, TResult, TTransformed> {
  CustomWorker: WorkerTaskCustomClass;
  kind: "custom";
}

export interface WorkerInputMessage<TData> {
  taskId: number;
  input: TData;
}

export interface WorkerOutputMessage<TResult> {
  taskId: number;
  result: TResult;
}

export interface TaskWorkerBase {
  worker: Worker;
  busy: boolean;
}

export interface TaskWorkerConverted extends TaskWorkerBase {
  kind: "converted";
  workerURL: string;
}

export interface TaskWorkerCustom extends TaskWorkerBase {
  kind: "custom";
  CustomWorker: WorkerTaskCustomClass;
}

export type TaskWorker = TaskWorkerConverted | TaskWorkerCustom;

export type WorkerPoolEvents = {
  error: [id: number, error: Error];
  done: [id: number, result: any, task: WorkerTask<any, any>];
};

export class WorkerPool {
  /**
   * Maximum number of workers working in parallel
   */
  private readonly concurrency: number;
  private readonly logger: ILogger;
  /**
   * Map from task id to worker task data
   */
  private readonly backlog: Map<number, WorkerTask<any, any>>;
  /**
   * Set holding currenly running worker task ids
   */
  private readonly running: Set<number>;

  /**
   * Events manager used to communicate to and from worker results and outside calls
   */
  private readonly events: Events<WorkerPoolEvents>;
  /**
   * Map used to cache worker fn strings and their associated worker URLs
   * Allows reusing a single worker URL for subsequent calls to the same function
   */
  private readonly workerURLCache: Map<string, string>;
  /**
   * Map of worker url to worker;
   * Allows reusing a worker for another instance of the same task if not busy
   */
  private readonly workerCache: Set<TaskWorker>;
  /**
   * Counter used to assign ids to worker tasks
   */
  private taskIdCounter: number;

  static get MAX_CONCURRENCY() {
    return navigator.hardwareConcurrency;
  }

  static get DEFAULT_CONCURRENCY() {
    return Math.ceil(WorkerPool.MAX_CONCURRENCY / 2);
  }

  static WORKER_FN_TEMPLATE(fnString: string) {
    return `
function isTransferable(data) {
  return (
    data instanceof OffscreenCanvas ||
    data instanceof ImageBitmap ||
    data instanceof MessagePort ||
    data instanceof MediaSourceHandle ||
    data instanceof ReadableStream ||
    data instanceof WritableStream ||
    data instanceof TransformStream ||
    data instanceof AudioData ||
    data instanceof VideoFrame ||
    data instanceof RTCDataChannel ||
    data instanceof ArrayBuffer
  );
}

self.onmessage = async (e) => {
const result = await (${fnString})(e.data.input);
self.postMessage({taskId: e.data.taskId, result}, isTransferable(result) ? [result] : []);
};
`;
  }

  constructor(concurrency = WorkerPool.DEFAULT_CONCURRENCY) {
    this.logger = Logger.derive("WorkerPool", { hideDebug: true });
    this.concurrency = clamp(concurrency, 1, WorkerPool.MAX_CONCURRENCY);
    this.backlog = new Map();
    this.running = new Set();
    this.workerURLCache = new Map();
    this.workerCache = new Set();
    this.events = new Events<WorkerPoolEvents>();
    this.taskIdCounter = 0;
  }

  /**
   * Number of workers either created but not busy or free to be created
   */
  private get IDLE_WORKER_COUNT() {
    return this.concurrency - this.running.size;
  }

  /**
   * Converts a client (ui-thread) side function to its worker-side source code
   * @param {WorkerFn<any, any>} fn - A function to run inside a worker
   * @returns
   */
  private stringifyWorkerFn(fn: WorkerFn<any, any>): string {
    const str = fn.toString();
    const startIndex = str.indexOf("(");
    const core = str.substring(startIndex);
    const asynced = `async function ${core}`;
    return asynced;
  }

  /**
   * Creates a {@link WorkerTaskConverted} from a function, its input and an optional worker function.
   * @param fn - The function to be executed inside a the worker task
   * @param input - The function's input
   * @param [transformFn] - Optional transformer function used to parse / change the returned result of the task
   * @returns A {@link WorkerTaskConverted}
   */
  private makeWorkerTask<TData, TResult, TTransformed>(
    fn: WorkerFn<TData, TResult>,
    input: TData,
    transformFn?: WorkerTransformFn<TResult, TTransformed>,
  ): WorkerTaskConverted<TData, TResult, TTransformed> {
    const id = this.taskIdCounter++;
    const fnString = this.stringifyWorkerFn(fn);
    const workerFnString = WorkerPool.WORKER_FN_TEMPLATE(fnString);
    return {
      id,
      fn,
      input,
      fnString,
      workerFnString,
      transformFn,
      type: "task",
      kind: "converted",
    };
  }

  public makeWorkerTaskCustom<TData, TResult, TTransformed = TResult>(
    CustomWorker: WorkerTaskCustomClass,
    input: TData,
    transformFn?: WorkerTransformFn<TResult, TTransformed>,
  ): WorkerTaskCustom<TData, TResult, TTransformed> {
    const id = this.taskIdCounter++;
    return {
      id,
      input,
      transformFn,
      CustomWorker,
      type: "task",
      kind: "custom",
    };
  }

  /**
   * Creates a new local URL for a {@link WorkerTaskConverted}'s worker source code
   */
  private makeWorkerURL<TData, TResult>(
    task: WorkerTaskConverted<TData, TResult>,
  ): string {
    const blob = new Blob([task.workerFnString], {
      type: "application/javascript; charset=utf-8",
    });
    return URL.createObjectURL(blob);
  }

  private getWorkerURL<TData, TResult>(
    task: WorkerTaskConverted<TData, TResult>,
  ): string {
    if (this.workerURLCache.has(task.fnString)) {
      this.logger.debug(
        `worker url cache hit for task ${task.id}`,
        "getWorkerUrl",
      );
      return this.workerURLCache.get(task.fnString)!;
    }
    this.logger.debug(
      `worker url cache miss for task ${task.id}`,
      "getWorkerUrl",
    );
    const url = this.makeWorkerURL(task);
    this.workerURLCache.set(task.fnString, url);
    return url;
  }

  private listenToWorkerTask<TResult, TTransformed = TResult>(
    taskId: number,
  ): Promise<TTransformed> {
    return new Promise<TTransformed>((resolve, reject) => {
      const eventName = `WorkerPool::listenToWorkerTask::${taskId}`;
      this.events.on(
        "done",
        (
          id: number,
          result: TResult,
          { transformFn }: WorkerTask<any, TResult, TTransformed>,
        ) => {
          if (id !== taskId) return;
          this.logger.debug(`task ${taskId} completed`);
          this.events.off("done", eventName);
          if (transformFn) {
            resolve(transformFn(result));
          }
          resolve(result as unknown as TTransformed);
        },
        eventName,
      );
      this.events.on(
        "error",
        (id: number, error) => {
          if (id !== taskId) return;
          this.logger.error(error);
          this.logger.error(`task ${taskId} error, see above`);
          this.events.off("error", eventName);
          reject(error);
        },
        eventName,
      );
    });
    // // // cleanup events
    // // this.logger.debug(`cleanup ${eventName}`);
    // // this.events.off("done", eventName);
    // // this.events.off("error", eventName);
    // // console.log("result:", result);
    // return result;
  }

  private makeTaskWorker(
    task: WorkerTask<any, any>,
    defaultBusy = true,
  ): TaskWorker {
    this.logger.debug(`creating new worker for task ${task.id}`);
    const busy = {
      busy: defaultBusy,
    };
    switch (task.kind) {
      case "converted": {
        const workerURL = this.getWorkerURL(task);
        const worker = new Worker(workerURL);
        return {
          ...busy,
          kind: "converted",
          worker,
          workerURL,
        };
      }
      default: {
        const { CustomWorker } = task;
        const worker = new CustomWorker();
        return {
          ...busy,
          kind: "custom",
          CustomWorker,
          worker,
        };
      }
    }
  }

  private pruneWorkerCache() {
    // remove non-busy exceeding workers
    const exceedingWorkerCount = clamp(
      this.workerCache.size - this.concurrency,
      0,
      Infinity,
    );
    this.logger.debug({ exceedingWorkerCount, size: this.workerCache.size });
    if (exceedingWorkerCount) {
      this.logger.debug(`${exceedingWorkerCount} exceeding workers in cache`);
      let terminatedWorkerCount = 0;
      for (const item of this.workerCache) {
        if (!item.busy && terminatedWorkerCount < exceedingWorkerCount) {
          item.worker.terminate();
          this.workerCache.delete(item);
          this.logger.debug(
            `terminated & deleted cached worker (${item.kind === "converted" ? item.worker : item.CustomWorker})`,
          );
          terminatedWorkerCount++;
        }
      }
    }
  }

  private findFreeCachedWorkerForTask<TData, TResult>(
    task: WorkerTask<TData, TResult>,
  ): Nullable<TaskWorker> {
    const cachedWorkers = Array.from(this.workerCache.values());
    let freeWorker: Optional<TaskWorker>;
    switch (task.kind) {
      case "converted": {
        const url = this.getWorkerURL(task);
        freeWorker = cachedWorkers.find((item) => {
          return (
            item.kind === "converted" && item.workerURL === url && !item.busy
          );
        });
        break;
      }
      default: {
        freeWorker = cachedWorkers.find((item) => {
          return (
            item.kind === "custom" &&
            item.CustomWorker &&
            task.CustomWorker &&
            !item.busy
          );
        });
      }
    }
    if (freeWorker) {
      this.logger.debug(`reusing worker for task ${task.id}`);
      freeWorker.busy = true;
      return freeWorker;
    }

    return null;
  }

  private getTaskWorker<TData, TResult>(
    task: WorkerTask<TData, TResult>,
  ): TaskWorker {
    // if a worker compatible with this task is already cached and not busy, reuse it
    const freeWorker = this.findFreeCachedWorkerForTask(task);
    if (freeWorker) return freeWorker;

    // remove non-busy exceeding workers
    this.pruneWorkerCache();

    // create a new worker and add it to the cache
    const newWorker = this.makeTaskWorker(task);

    this.workerCache.add(newWorker);
    return newWorker;
  }

  private freeTaskWorker(worker: TaskWorker) {
    worker.busy = false;
  }

  private endTask(taskId: number, worker: TaskWorker) {
    this.logger.debug(`end task ${taskId}`);
    this.running.delete(taskId);
    this.freeTaskWorker(worker);
    this.runNextTask();
  }

  private runWorkerTask<TData, TResult>(task: WorkerTask<TData, TResult>) {
    // mark as running and remove from backlog
    this.running.add(task.id);
    this.backlog.delete(task.id);
    this.logger.debug(`task ${task.id} added to queue & removed from backlog`);
    // get a worker for the task
    const worker = this.getTaskWorker(task);
    // bind events to worker
    worker.worker.onmessage = ({
      data,
    }: {
      data: WorkerOutputMessage<TResult>;
    }) => {
      this.events.trigger("done", data.taskId, data.result, task);
      this.endTask(task.id, worker);
    };
    worker.worker.onerror = ({ error }) => {
      this.events.trigger("error", task.id, error);
      this.endTask(task.id, worker);
    };
    // execute task on worker
    this.logger.debug(`running task ${task.id} in worker`);
    worker.worker.postMessage({
      taskId: task.id,
      input: task.input,
    });
  }

  private runNextTask() {
    // get task to run
    const task = Array.from(this.backlog.values()).at(0);
    if (!task) {
      this.logger.debug("no task to run in backlog", "runNextTask");
      return;
    }
    this.logger.debug(`attempting to run task ${task.id}`);
    if (!this.IDLE_WORKER_COUNT) {
      this.logger.debug(
        `no idle worker: ${this.running.size} tasks already running`,
        "runNextTask",
      );
      return;
    }
    // run task
    this.runWorkerTask(task);
    // execute next task in backlog if available workers
    this.runNextTask();
  }

  private addTaskToBacklog<TData, TResult>(
    task: WorkerTask<TData, TResult, any>,
  ) {
    this.backlog.set(task.id, task);
  }

  public execute<TData, TResult, TTransformed = TResult>(
    fn: WorkerFn<TData, TResult>,
    input: TData,
    transformFn?: WorkerTransformFn<TResult, TTransformed>,
  ): Promise<TTransformed> {
    const task = this.makeWorkerTask(fn, input, transformFn);
    this.addTaskToBacklog(task);
    // console.warn(task.id);
    this.logger.debug(`task ${task.id} added to backlog`);
    // run backlog
    this.runNextTask();
    // return a promise that fullfills when task is done
    return this.listenToWorkerTask<TResult, TTransformed>(task.id);
  }

  public executeCustom<TData, TResult, TTransformed = TResult>(
    CustomWorker: WorkerTaskCustomClass,
    input: TData,
    transformFn?: WorkerTransformFn<TResult, TTransformed>,
  ) {
    const task = this.makeWorkerTaskCustom(CustomWorker, input, transformFn);
    this.addTaskToBacklog(task);
    // run backlog
    this.runNextTask();
    // return a promise that fullfills when task is done
    return this.listenToWorkerTask<TResult, TTransformed>(task.id);
  }

  public executeMultiple<TData, TResult, TTransformed = TResult>(
    fn: WorkerFn<TData, TResult>,
    inputs: TData[],
    transformFn?: WorkerTransformFn<TResult, TTransformed>,
  ): Promise<TTransformed[]> {
    const promises: Promise<TTransformed>[] = [];
    // create one task per input and add it to backlog
    for (const input of inputs) {
      const task = this.makeWorkerTask(fn, input, transformFn);
      this.addTaskToBacklog(task);
      promises.push(this.listenToWorkerTask<TResult, TTransformed>(task.id));
    }
    // run backlog
    this.runNextTask();
    // return a promise that fullfills when task is done
    return Promise.all(promises);
  }
}
