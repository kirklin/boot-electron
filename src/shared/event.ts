import type { IDisposable } from "./lifecycle";
import { Disposable, DisposableStore, toDisposable } from "./lifecycle";
import { LinkedList } from "./linkedList";

// --- Interfaces and simple types

/**
 * @en A placeholder for a CancellationToken. In a real implementation, this would
 * be part of a proper async cancellation infrastructure.
 * @zh CancellationToken 的占位符。在实际实现中，这将是异步取消基础结构的一部分。
 */
export interface CancellationToken {
  readonly isCancellationRequested: boolean;
  readonly onCancellationRequested: Event<any>;
}

/**
 * @en An event with zero or one parameters that can be subscribed to. The event is a function itself.
 * @zh 一个可以订阅的、具有零个或一个参数的事件。事件本身就是一个函数。
 */
export interface Event<T> {
  (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
}

/**
 * @en Options for configuring an Emitter.
 * @zh 用于配置 Emitter 的选项。
 */
export interface EmitterOptions {
  /**
   * @en Optional function that's called *before* the very first listener is added.
   * @zh 在添加第一个监听器*之前*调用的可选函数。
   */
  onFirstListenerAdd?: () => void;
  /**
   * @en Optional function that's called *after* the very first listener is added.
   * @zh 在添加第一个监听器*之后*调用的可选函数。
   */
  onFirstListenerDidAdd?: () => void;
  /**
   * @en Optional function that's called after any listener is added.
   * @zh 添加任何监听器后调用的可选函数。
   */
  onListenerDidAdd?: () => void;
  /**
   * @en Optional function that's called *after* the very last listener is removed.
   * @zh 移除最后一个监听器*之后*调用的可选函数。
   */
  onLastListenerRemove?: () => void;
}

/**
 * @en A helper function for unexpected errors.
 * @zh 处理意外错误的辅助函数。
 */
function onUnexpectedError(e: any) {
  console.error(e);
}

// --- Event utilities

/**
 * @en An event that never fires.
 * @zh 一个永远不会触发的事件。
 */
export const EventNone: Event<any> = () => Disposable.None;

/**
 * @internal
 * @en A helper function to create a snapshot of an event.
 * @zh 一个内部辅助函数，用于创建事件的快照。
 */
function snapshot<T>(event: Event<T>, disposable: DisposableStore | undefined): Event<T> {
  let listener: IDisposable | undefined;
  let emitter: Emitter<T>;

  const options: EmitterOptions | undefined = {
    onFirstListenerAdd() {
      listener = event(emitter.fire, emitter);
    },
    onLastListenerRemove() {
      listener?.dispose();
    },
  };

  emitter = new Emitter<T>(options);
  disposable?.add(emitter);
  return emitter.event;
}

/**
 * @en Maps the data of an event to a new type or value.
 * @zh 将事件的数据映射为新的类型或值。
 * @param event The original event.
 * @param map The mapping function.
 * @param disposable An optional disposable store to add the new event to.
 */
export function map<I, O>(event: Event<I>, map: (i: I) => O, disposable?: DisposableStore): Event<O> {
  return snapshot((listener, thisArgs = null, disposables?) => event(i => listener.call(thisArgs, map(i)), null, disposables), disposable);
}

/**
 * @en Filters an event, only firing when the filter function returns true.
 * @zh 过滤一个事件，仅当过滤函数返回 true 时才触发。
 * @param event The original event.
 * @param filter The filter function.
 * @param disposable An optional disposable store to add the new event to.
 */
export function filter<T>(event: Event<T>, filter: (e: T) => boolean, disposable?: DisposableStore): Event<T>;
export function filter<T, R>(event: Event<T | R>, filter: (e: T | R) => e is R, disposable?: DisposableStore): Event<R>;
export function filter<T>(event: Event<T>, filter: (e: T) => boolean, disposable?: DisposableStore): Event<T> {
  return snapshot((listener, thisArgs = null, disposables?) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables), disposable);
}

/**
 * @en Debounces an event, grouping rapid-fire events into a single event after a specified delay.
 * @zh 对事件进行防抖处理，将快速连续触发的事件在指定延迟后合并为一次触发。
 * @param event The original event.
 * @param merge A function to merge multiple event payloads into one.
 * @param delay The debounce delay in milliseconds.
 * @param leading Whether to fire the event on the leading edge of the timeout.
 * @param disposable An optional disposable store to add the new event to.
 */
export function debounce<T>(event: Event<T>, merge: (last: T | undefined, event: T) => T, delay?: number, leading?: boolean, disposable?: DisposableStore): Event<T>;
export function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay?: number, leading?: boolean, disposable?: DisposableStore): Event<O>;
export function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay = 100, leading = false, disposable?: DisposableStore): Event<O> {
  let subscription: IDisposable;
  let output: O | undefined;
  let handle: any;
  let numDebouncedCalls = 0;
  const emitter = new Emitter<O>({
    onFirstListenerAdd() {
      subscription = event((cur) => {
        numDebouncedCalls++;
        output = merge(output, cur);

        if (leading && !handle) {
          emitter.fire(output!);
          output = undefined;
        }

        clearTimeout(handle);
        handle = setTimeout(() => {
          const _output = output;
          output = undefined;
          handle = undefined;
          if (!leading || numDebouncedCalls > 1) {
            emitter.fire(_output!);
          }
          numDebouncedCalls = 0;
        }, delay);
      });
    },
    onLastListenerRemove() {
      subscription.dispose();
    },
  });

  disposable?.add(emitter);
  return emitter.event;
}

/**
 * @en Buffers events and fires them all at once when the buffer is flushed.
 * @zh 缓冲事件，并在缓冲区刷新时一次性全部触发。
 * @param event The original event.
 * @param flushAfterTimeout Whether to flush the buffer after a timeout.
 * @param _buffer An optional initial buffer.
 * @param disposable An optional disposable store to add the new event to.
 */
export function buffer<T>(event: Event<T>, flushAfterTimeout = false, _buffer: T[] = [], disposable?: DisposableStore): Event<T> {
  let buffer: T[] | null = _buffer.slice();
  let emitter: Emitter<T>;

  const listener: IDisposable | null = event((e) => {
    if (buffer) {
      buffer.push(e);
    } else {
      emitter.fire(e);
    }
  });

  disposable?.add(toDisposable(() => listener?.dispose()));

  const flush = () => {
    buffer?.forEach(e => emitter.fire(e));
    buffer = null;
  };

  emitter = new Emitter<T>({
    onFirstListenerDidAdd() {
      if (buffer) {
        if (flushAfterTimeout) {
          setTimeout(flush);
        } else {
          flush();
        }
      }
    },
    onLastListenerRemove() {
      listener?.dispose();
    },
  });

  disposable?.add(emitter);
  return emitter.event;
}

// --- Core Emitter class

type Listener<T> = [(e: T) => void, any | undefined];

/**
 * @en The Emitter is the core of the event system. It is the source of events and allows firing them.
 * It is designed to be kept private within a class, while its `event` property is exposed publicly.
 * @zh Emitter 是事件系统的核心。它是事件的源头，并允许触发事件。
 * 设计上，Emitter 实例应在类内部保持私有，而其 `event` 属性则对外暴露。
 */
export class Emitter<T> {
  private _options?: EmitterOptions;
  private _event?: Event<T>;
  protected _listeners?: LinkedList<Listener<T>>;

  constructor(options?: EmitterOptions) {
    this._options = options;
  }

  /**
   * @en The public-facing event that consumers can subscribe to.
   * @zh 面向消费者的公开事件，可以被订阅。
   */
  get event(): Event<T> {
    if (!this._event) {
      this._event = (listener: (e: T) => void, thisArgs?: any, disposables?: IDisposable[] | DisposableStore) => {
        if (!this._listeners) {
          this._listeners = new LinkedList();
        }

        const firstListener = this._listeners.isEmpty();
        if (firstListener) {
          this._options?.onFirstListenerAdd?.();
        }

        const remove = this._listeners.push([listener, thisArgs]);

        if (firstListener) {
          this._options?.onFirstListenerDidAdd?.();
        }
        this._options?.onListenerDidAdd?.();

        const result = toDisposable(() => {
          remove();
          if (this._listeners?.isEmpty()) {
            this._options?.onLastListenerRemove?.();
          }
        });

        if (disposables instanceof DisposableStore) {
          disposables.add(result);
        } else if (Array.isArray(disposables)) {
          disposables.push(result);
        }

        return result;
      };
    }
    return this._event;
  }

  /**
   * @en Fires an event with the given payload to all subscribers.
   * @zh 向所有订阅者触发一个带有指定负载的事件。
   * @param event The payload of the event.
   */
  fire(event: T): void {
    if (this._listeners) {
      for (const [listener, thisArgs] of this._listeners) {
        try {
          listener.call(thisArgs, event);
        } catch (e) {
          onUnexpectedError(e);
        }
      }
    }
  }

  /**
   * @en Disposes the emitter, removing all listeners.
   * @zh 销毁发射器，移除所有监听器。
   */
  dispose() {
    if (this._listeners) {
      this._listeners.clear();
      this._options?.onLastListenerRemove?.();
    }
  }
}

// --- Advanced Emitter and utility classes

export interface IWaitUntil {
  token: CancellationToken;
  waitUntil: (thenable: Promise<unknown>) => void;
}

export type IWaitUntilData<T> = Omit<Omit<T, "waitUntil">, "token">;

/**
 * @en An Emitter that allows for asynchronous event delivery.
 * Listeners can perform async work and the emitter will wait for it to complete.
 * This is crucial for AI-related tasks that might involve long computations or network requests.
 * @zh 一个支持异步事件传递的 Emitter。
 * 监听器可以执行异步工作，发射器会等待其完成。
 * 这对于可能涉及长时间计算或网络请求的 AI 相关任务至关重要。
 */
export class AsyncEmitter<T extends IWaitUntil> extends Emitter<T> {
  private _asyncDeliveryQueue?: LinkedList<[Listener<T>, IWaitUntilData<T>]>;

  /**
   * @en Fires the event asynchronously.
   * @zh 异步触发事件。
   * @param data The event data.
   * @param token A cancellation token.
   * @param promiseJoin A function to chain promises.
   */
  async fireAsync(data: IWaitUntilData<T>, token: CancellationToken, promiseJoin?: (p: Promise<unknown>, listener: (e: T) => void) => Promise<unknown>): Promise<void> {
    if (!this._listeners) {
      return;
    }

    if (!this._asyncDeliveryQueue) {
      this._asyncDeliveryQueue = new LinkedList();
    }

    for (const listener of this._listeners!) {
      this._asyncDeliveryQueue.push([listener, data]);
    }

    while (!this._asyncDeliveryQueue.isEmpty() && !token.isCancellationRequested) {
      const [listenerTuple, eventData] = this._asyncDeliveryQueue.shift()!;
      const [listener, thisArgs] = listenerTuple;
      const thenables: Promise<unknown>[] = [];

      const event = <T>{
        ...eventData,
        token,
        waitUntil: (p: Promise<unknown>): void => {
          if (Object.isFrozen(thenables)) {
            throw new Error("waitUntil can NOT be called asynchronous.");
          }
          if (promiseJoin) {
            p = promiseJoin(p, listener);
          }
          thenables.push(p);
        },
      };

      try {
        listener.call(thisArgs, event);
      } catch (e) {
        onUnexpectedError(e);
        continue;
      }

      Object.freeze(thenables);

      await Promise.allSettled(thenables).then((values) => {
        for (const value of values) {
          if (value.status === "rejected") {
            onUnexpectedError(value.reason);
          }
        }
      });
    }
  }
}

/**
 * @en An EventMultiplexer combines multiple event sources into a single event stream.
 * When any of the input events fire, the multiplexer's event will fire.
 * This is useful for multi-window scenarios where you want to listen to the same type of event from different windows.
 * @zh EventMultiplexer 将多个事件源合并为单个事件流。
 * 当任何一个输入事件触发时，复用器的事件也会触发。
 * 这对于需要监听来自不同窗口的同类型事件的多窗口场景非常有用。
 */
export class EventMultiplexer<T> implements IDisposable {
  private readonly emitter: Emitter<T>;
  private hasListeners = false;
  private events: { event: Event<T>; listener: IDisposable | null }[] = [];

  constructor() {
    this.emitter = new Emitter<T>({
      onFirstListenerAdd: () => this.onFirstListenerAdd(),
      onLastListenerRemove: () => this.onLastListenerRemove(),
    });
  }

  /**
   * @en The combined event stream.
   * @zh 合并后的事件流。
   */
  get event(): Event<T> {
    return this.emitter.event;
  }

  /**
   * @en Adds an event to the multiplexer.
   * @zh 向复用器添加一个事件。
   * @param event The event to add.
   * @returns A disposable to remove the event from the multiplexer.
   */
  add(event: Event<T>): IDisposable {
    const e: { event: Event<T>; listener: IDisposable | null } = { event, listener: null };
    this.events.push(e);

    if (this.hasListeners) {
      this.hook(e);
    }

    return toDisposable(() => {
      if (this.hasListeners) {
        this.unhook(e);
      }
      const idx = this.events.indexOf(e);
      this.events.splice(idx, 1);
    });
  }

  private onFirstListenerAdd(): void {
    this.hasListeners = true;
    this.events.forEach(e => this.hook(e));
  }

  private onLastListenerRemove(): void {
    this.hasListeners = false;
    this.events.forEach(e => this.unhook(e));
  }

  private hook(e: { event: Event<T>; listener: IDisposable | null }): void {
    e.listener = e.event(r => this.emitter.fire(r));
  }

  private unhook(e: { event: Event<T>; listener: IDisposable | null }): void {
    e.listener?.dispose();
    e.listener = null;
  }

  dispose(): void {
    this.emitter.dispose();
  }
}

/**
 * @en A Relay acts as a switchable proxy for an event. You can change its `input` event at any time,
 * and listeners will automatically start receiving events from the new source without needing to re-subscribe.
 * @zh Relay 充当事件的可切换代理。你可以随时更改其 `input` 事件，
 * 监听器将自动开始从新的事件源接收事件，而无需重新订阅。
 */
export class Relay<T> implements IDisposable {
  private listening = false;
  private inputEvent: Event<T> = EventNone;
  private inputEventListener: IDisposable = Disposable.None;

  private readonly emitter = new Emitter<T>({
    onFirstListenerAdd: () => {
      this.listening = true;
      this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
    },
    onLastListenerRemove: () => {
      this.listening = false;
      this.inputEventListener.dispose();
    },
  });

  readonly event: Event<T> = this.emitter.event;

  /**
   * @en The input event to be relayed.
   * @zh 要被中继的输入事件。
   */
  get input(): Event<T> {
    return this.inputEvent;
  }

  set input(event: Event<T>) {
    this.inputEvent = event;
    if (this.listening) {
      this.inputEventListener.dispose();
      this.inputEventListener = event(this.emitter.fire, this.emitter);
    }
  }

  dispose() {
    this.inputEventListener.dispose();
    this.emitter.dispose();
  }
}
