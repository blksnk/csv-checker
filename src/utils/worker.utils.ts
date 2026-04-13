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

/**
 * Function executed inside a worker; receives deserialized `input` and returns a result.
 *
 * @template TData - Payload posted to the worker
 * @template TResult - Raw worker return type
 */
export type WorkerFn<TData, TResult> = MaybeAsyncFn<[TData], TResult>;

/**
 * Optional post-process step applied on the main thread after a worker resolves.
 *
 * @template TResult - Worker output type
 * @template TTransformedResult - Value passed to the task promise
 */
export type WorkerTransformFn<TResult, TTransformedResult> = GenericFn<
  [TResult],
  TTransformedResult
>;

/**
 * Shared fields for queued worker tasks.
 *
 * @template TData - Input payload type
 * @template TResult - Worker result type
 * @template TTransformed - Type after `transformFn`, defaults to `TResult`
 */
interface WorkerTaskBase<TData, TResult, TTransformed = TResult> {
  id: number;
  input: TData;
  transformFn?: WorkerTransformFn<TResult, TTransformed>;
  type: "task";
}

/**
 * Task backed by an async function stringified and run inside a blob worker.
 *
 * @template TData - Input payload type
 * @template TResult - Worker result type
 * @template TTransformed - Type after optional `transformFn`
 */
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

/**
 * A queued unit of work: either a converted function task or a custom worker class.
 *
 * @template TData - Input payload type
 * @template TResult - Worker result type
 * @template TTransformed - Type after optional `transformFn`
 */
export type WorkerTask<TData, TResult, TTransformed = TResult> =
  | WorkerTaskConverted<TData, TResult, TTransformed>
  | WorkerTaskCustom<TData, TResult, TTransformed>;

/** Constructor for a dedicated `Worker` subclass used by {@link WorkerTaskCustom}. */
export interface WorkerTaskCustomClass {
  new (): Worker;
}

/**
 * Task that instantiates a hand-written `Worker` implementation.
 *
 * @template TData - Input payload type
 * @template TResult - Message result type
 * @template TTransformed - Type after optional `transformFn`
 */
export interface WorkerTaskCustom<
  TData,
  TResult,
  TTransformed = TResult,
> extends WorkerTaskBase<TData, TResult, TTransformed> {
  CustomWorker: WorkerTaskCustomClass;
  kind: "custom";
}

/** Message posted to a worker: task id plus input payload. */
export interface WorkerInputMessage<TData> {
  taskId: number;
  input: TData;
}

/** Message received from a worker: task id plus result value. */
export interface WorkerOutputMessage<TResult> {
  taskId: number;
  result: TResult;
}

/** Running worker slot with busy flag. */
export interface TaskWorkerBase {
  worker: Worker;
  busy: boolean;
}

/** Worker created from a blob URL for converted-function tasks. */
export interface TaskWorkerConverted extends TaskWorkerBase {
  kind: "converted";
  workerURL: string;
}

/** Worker instance for a custom worker class task. */
export interface TaskWorkerCustom extends TaskWorkerBase {
  kind: "custom";
  CustomWorker: WorkerTaskCustomClass;
}

/** Union of pooled worker handles. */
export type TaskWorker = TaskWorkerConverted | TaskWorkerCustom;

/** Events emitted internally by {@link WorkerPool}. */
export type WorkerPoolEvents = {
  error: [id: number, error: Error];
  done: [id: number, result: any, task: WorkerTask<any, any>];
};

/**
 * Pools Web Workers with a bounded concurrency, reusing blob URLs and idle workers when possible.
 */
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

  /**
   * Hardware concurrency reported by the browser (`navigator.hardwareConcurrency`).
   *
   * @return {number} Upper bound for worker count
   */
  static get MAX_CONCURRENCY() {
    return navigator.hardwareConcurrency;
  }

  /**
   * Default pool size: half of {@link WorkerPool.MAX_CONCURRENCY}, rounded up.
   *
   * @return {number} Suggested default concurrency
   */
  static get DEFAULT_CONCURRENCY() {
    return Math.ceil(WorkerPool.MAX_CONCURRENCY / 2);
  }

  /**
   * Wraps serialized async function source as worker `onmessage` handler source.
   *
   * @param {string} fnString - Async function body from {@link WorkerPool.stringifyWorkerFn}
   * @return {string} Complete worker script
   */
  static WORKER_FN_TEMPLATE(fnString: string) {
    return `
function isTransferable(data) {
  return (
    data instanceof OffscreenCanvas ||
    data instanceof ImageBitmap ||
    data instanceof MessagePort ||
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

  /**
   * @param {number} [concurrency=WorkerPool.DEFAULT_CONCURRENCY] - Max parallel workers (clamped to hardware limits)
   */
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
   * Converts a main-thread function to async worker source (prepended with `async function`).
   *
   * @param {WorkerFn<any, any>} fn - Function to stringify for the worker blob
   * @return {string} Async function source suitable for {@link WorkerPool.WORKER_FN_TEMPLATE}
   */
  private stringifyWorkerFn(fn: WorkerFn<any, any>): string {
    const str = fn.toString();
    const startIndex = str.indexOf("(");
    const core = str.substring(startIndex);
    const asynced = `async function ${core}`;
    return asynced;
  }

  /**
   * Creates a {@link WorkerTaskConverted} from a function, input, and optional result transform.
   *
   * @template TData - Worker input type
   * @template TResult - Raw worker output type
   * @template TTransformed - Type after optional `transformFn`
   * @param {WorkerFn<TData, TResult>} fn - Function executed in the worker
   * @param {TData} input - Payload for `fn`
   * @param {WorkerTransformFn<TResult, TTransformed>} [transformFn] - Optional main-thread mapping of the result
   * @return {WorkerTaskConverted<TData, TResult, TTransformed>} Task descriptor
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

  /**
   * Builds a custom-class worker task and assigns it an id.
   *
   * @template TData - Input type
   * @template TResult - Raw result type
   * @template TTransformed - Transformed result type
   * @param {WorkerTaskCustomClass} CustomWorker - Worker constructor
   * @param {TData} input - Payload for `postMessage`
   * @param {WorkerTransformFn<TResult, TTransformed>} [transformFn] - Optional result mapping
   * @return {WorkerTaskCustom<TData, TResult, TTransformed>} Task descriptor
   */
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
   * Creates a blob object URL for a converted task’s inlined worker script.
   *
   * @template TData - Task input type
   * @template TResult - Task result type
   * @param {WorkerTaskConverted<TData, TResult>} task - Task whose `workerFnString` is wrapped in a blob
   * @return {string} Object URL for `new Worker(url)`
   */
  private makeWorkerURL<TData, TResult>(
    task: WorkerTaskConverted<TData, TResult>,
  ): string {
    const blob = new Blob([task.workerFnString], {
      type: "application/javascript; charset=utf-8",
    });
    return URL.createObjectURL(blob);
  }

  /**
   * Resolves or creates a blob URL for a converted task, using an internal cache keyed by function string.
   *
   * @template TData - Task input type
   * @template TResult - Task result type
   * @param {WorkerTaskConverted<TData, TResult>} task - Converted task
   * @return {string} Object URL for `new Worker(url)`
   */
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

  /**
   * Subscribes once to pool `done` / `error` for a task id and resolves with the (optionally transformed) result.
   *
   * @template TResult - Raw worker result
   * @template TTransformed - Returned promise value type
   * @param {number} taskId - Task identifier
   * @return {Promise<TTransformed>} Completes when the task finishes or rejects on worker error
   */
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

  /**
   * Creates a new `Worker` for a task and marks it busy (or not) before returning.
   *
   * @param {WorkerTask<any, any>} task - Task to run
   * @param {boolean} [defaultBusy=true] - Initial `busy` flag on the handle
   * @return {TaskWorker} Worker handle
   */
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

  /** Terminates excess idle workers when the cache grows beyond {@link WorkerPool.concurrency}. */
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

  /**
   * Returns a matching idle cached worker for the task, or `null`.
   *
   * @template TData - Task input type
   * @template TResult - Task result type
   * @param {WorkerTask<TData, TResult>} task - Task about to run
   * @return {Nullable<TaskWorker>} Reused worker if found
   */
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

  /**
   * Gets a worker for the task, preferring cache reuse then pruning then creating a new one.
   *
   * @template TData - Task input type
   * @template TResult - Task result type
   * @param {WorkerTask<TData, TResult>} task - Task to run
   * @return {TaskWorker} Worker to post messages to
   */
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

  /** Marks a pooled worker as idle for reuse. */
  private freeTaskWorker(worker: TaskWorker) {
    worker.busy = false;
  }

  /** Finalizes a task: updates running set, frees worker, runs next backlog item. */
  private endTask(taskId: number, worker: TaskWorker) {
    this.logger.debug(`end task ${taskId}`);
    this.running.delete(taskId);
    this.freeTaskWorker(worker);
    this.runNextTask();
  }

  /**
   * Starts a single task on a worker and wires `onmessage` / `onerror` to the pool events.
   *
   * @template TData - Task input type
   * @template TResult - Task result type
   * @param {WorkerTask<TData, TResult>} task - Task to execute
   * @return {void}
   */
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

  /** Pops the next backlog task if an idle worker slot exists and runs it (recursive). */
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

  /**
   * @template TData - Task input type
   * @template TResult - Task result type
   * @param {WorkerTask<TData, TResult, any>} task - Task to queue
   * @return {void}
   */
  private addTaskToBacklog<TData, TResult>(
    task: WorkerTask<TData, TResult, any>,
  ) {
    this.backlog.set(task.id, task);
  }

  /**
   * Queues a function to run in a worker and returns a promise for its result.
   *
   * @template TData - Worker input type
   * @template TResult - Raw worker output type
   * @template TTransformed - Promise resolution type after `transformFn`
   * @param {WorkerFn<TData, TResult>} fn - Function serialized into a worker
   * @param {TData} input - Argument passed to `fn`
   * @param {WorkerTransformFn<TResult, TTransformed>} [transformFn] - Optional post-processing on the main thread
   * @return {Promise<TTransformed>} Completes when the worker finishes
   */
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

  /**
   * Like {@link WorkerPool.execute} but uses a custom `Worker` subclass instead of a serialized function.
   *
   * @template TData - Worker input type
   * @template TResult - Raw worker output type
   * @template TTransformed - Promise resolution type after `transformFn`
   * @param {WorkerTaskCustomClass} CustomWorker - Worker constructor
   * @param {TData} input - `postMessage` payload
   * @param {WorkerTransformFn<TResult, TTransformed>} [transformFn] - Optional result transform
   * @return {Promise<TTransformed>} Completes when the worker finishes
   */
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

  /**
   * Queues one worker task per input, sharing the same function and optional transform.
   *
   * @template TData - Per-task input type
   * @template TResult - Raw worker output type
   * @template TTransformed - Per-result type after `transformFn`
   * @param {WorkerFn<TData, TResult>} fn - Function serialized into workers
   * @param {TData[]} inputs - One invocation per item
   * @param {WorkerTransformFn<TResult, TTransformed>} [transformFn] - Optional per-result transform
   * @return {Promise<TTransformed[]>} Resolves when all tasks complete
   */
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
