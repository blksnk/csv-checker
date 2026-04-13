import {
  isArray,
  isString,
  type MaybeAsyncFn,
  type Nullable,
} from "@ubloimmo/front-util";
import { Logger } from "./logger.utils";

/** Maps event names to tuple types of listener arguments. */
type EventDef = {
  [key: string]: unknown[];
};

/** Listener invoked when an event fires. */
type EventCallback<TParams extends unknown[]> = MaybeAsyncFn<TParams, void>;

/** Ordered buckets of named listeners per event. */
type EventOrderedGroup<TParams extends unknown[]> = Array<
  Map<string, EventCallback<TParams>>
>;

/**
 * String event names declared on the definition `TDef`.
 *
 * @template TDef - Event name to argument-tuple map
 */
export type EventName<TDef extends EventDef> = keyof TDef & string;

/** Argument tuple for a given event on `TDef`. */
type EventParams<
  TDef extends EventDef,
  TEventName extends EventName<TDef>,
> = TDef[TEventName];

/** Internal listener registry keyed by event name. */
type EventRepo<TDef extends EventDef> = {
  [TEventName in EventName<TDef>]: EventOrderedGroup<TDef[TEventName]>;
};

/**
 * Lightweight typed pub/sub with ordered listener groups and named callbacks.
 *
 * @template TDef - Event name to argument-tuple map
 */
export class Events<TDef extends EventDef> {
  private listeners: EventRepo<TDef> = {} as EventRepo<TDef>;
  private logger = Logger.derive("Events", { hideDebug: true });

  constructor() {}

  /**
   * Registers a listener for an event.
   *
   * @template TEventName - Event key on `TDef`
   * @param {TEventName} name - Event name
   * @param {EventCallback<EventParams<TDef, TEventName>>} callback - Handler
   * @param {string} callbackName - Unique id for this registration (for `off`)
   * @param {number} [order=0] - Priority bucket (lower runs first)
   * @param {boolean} [replace=true] - Replace an existing listener with the same `callbackName`
   * @return {void}
   */
  public on<TEventName extends EventName<TDef>>(
    name: TEventName,
    callback: EventCallback<EventParams<TDef, TEventName>>,
    callbackName: string,
    order = 0,
    replace = true,
  ) {
    // create group if needed
    if (!(this.listeners[name] instanceof Array)) {
      this.listeners[name] = [];
    }
    // create ordered group if needed
    if (!(this.listeners[name][order] instanceof Map)) {
      this.listeners[name][order] = new Map();
    }
    // reject event listener if already bound
    const alreadyBound = this.listeners[name][order].has(callbackName);
    if (alreadyBound && !replace) {
      this.logger.warn(
        `Callback ${callbackName} already registered on event ${name}, order ${order} `,
      );
      return;
    }
    this.logger.debug(
      `${alreadyBound && replace ? "Replace" : "Store"} event ${name}, order ${order}, ${callbackName}`,
    );
    // store event callback
    this.listeners[name][order].set(callbackName, callback);
  }

  /**
   * Removes listeners for an event.
   *
   * @template TEventName - Event key on `TDef`
   * @param {TEventName} name - Event name
   * @param {Nullable<string>} callbackName - If set, removes that named listener; if nullish/empty, removes all listeners for `name`
   * @return {void}
   */
  public off<TEventName extends EventName<TDef>>(
    name: TEventName,
    callbackName: Nullable<string>,
  ) {
    // abort if group is unknown
    if (!(name in this.listeners)) return;

    // remove specific callback
    if (isString(callbackName) && callbackName.length) {
      const group = this.listeners[name];

      // abort if no group or no order array in group
      if (!group || !group.length) return;

      this.logger.debug(
        `Remove listener ${callbackName} from event ${name}`,
        "off",
      );
      for (const order in group) {
        // search for callback in each ordered group
        // const index = group[order].values().indexOf(callback);
        this.logger.debug(
          `Remove listener ${callbackName} from event ${name}, group ${order}`,
          "off",
        );
        const found = Array.from(group[order].keys()).find(
          (cbName) => cbName === callbackName,
        );
        // if found, remove it
        if (found) group[order].delete(found);
        // if (index !== -1) group[order].splice(index, 1);
      }
    }
    // remove all events in the group
    else {
      this.logger.debug(`Remove all listeners from event ${name}`, "off");
      if (!(name in this.listeners) || !isArray(this.listeners[name])) return;
      delete this.listeners[name];
    }
  }

  /**
   * Synchronously invokes all listeners for an event with the given arguments.
   *
   * @template TEventName - Event key on `TDef`
   * @param {TEventName} name - Event name
   * @param {...EventParams<TDef, TEventName>} args - Arguments forwarded to listeners
   * @return {void}
   */
  public trigger<TEventName extends EventName<TDef>>(
    name: TEventName,
    ...args: EventParams<TDef, TEventName>
  ) {
    if (
      !(name in this.listeners) ||
      !isArray(this.listeners[name]) ||
      !this.listeners[name].length
    )
      return;
    for (const order in this.listeners[name]) {
      for (const [_cbName, callback] of this.listeners[name][order]) {
        // this.logger.debug(
        //   `trigger event ${name}, order ${order}, callback ${_cbName}`,
        //   "trigger",
        // );
        callback.apply(this, args);
      }
    }
  }

  /**
   * Clears listeners globally or only those registered with `callbackName`.
   *
   * @param {string} [callbackName] - If provided, removes that id from every event; otherwise clears all events
   * @return {void}
   */
  public clear(callbackName?: string) {
    if (isString(callbackName) && callbackName.length) {
      for (const name in this.listeners) {
        if (!isArray(this.listeners[name]) || !this.listeners[name].length)
          continue;
        for (const order in this.listeners[name]) {
          const group = this.listeners[name][order];
          if (!group.size) continue;
          group.delete(callbackName);
        }
      }
      return;
    }
    for (const name in this.listeners) {
      delete this.listeners[name];
    }
  }
}
