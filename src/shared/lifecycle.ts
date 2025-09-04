/* ---------------------------------------------------------------------------------------------
 * A robust lifecycle management system for tracking and disposing of resources.
 * Includes utilities such as DisposableStore for managing collections, MutableDisposable
 * for handling replaceable resources, RefCountedDisposable for shared resources,
 * and DisposableMap for key-value resource management.
 *-------------------------------------------------------------------------------------------- */

import { createSingleCallFunction } from "./functional.js";

/**
 * An object that performs a cleanup operation when `.dispose()` is called.
 */
export interface IDisposable {
  dispose: () => void;
}

/**
 * Checks if a value is a disposable.
 */
export function isDisposable<E extends object>(thing: E): thing is E & IDisposable {
  return typeof (thing as IDisposable).dispose === "function" && (thing as IDisposable).dispose.length === 0;
}

/**
 * Disposes of the value(s) passed in.
 *
 * If an array is passed, it will make sure to dispose all elements, even if one throws an error.
 */
export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined;
export function dispose<T extends IDisposable>(disposables: T[]): T[];
export function dispose<T extends IDisposable>(disposables: readonly T[]): readonly T[];
export function dispose<T extends IDisposable>(arg: T | T[] | undefined): any {
  if (Array.isArray(arg)) {
    const errors: any[] = [];
    for (const d of arg) {
      if (d) {
        try {
          d.dispose();
        } catch (e) {
          errors.push(e);
        }
      }
    }
    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      throw new AggregateError(errors, "Encountered errors while disposing of store");
    }
    return [];
  } else if (arg) {
    arg.dispose();
    return arg;
  }
}

/**
 * Disposes of all disposables in the given array if they are disposable.
 */
export function disposeIfDisposable<T extends IDisposable | object>(disposables: Array<T>): Array<T> {
  for (const d of disposables) {
    if (isDisposable(d)) {
      d.dispose();
    }
  }
  return [];
}

/**
 * Combine multiple disposable values into a single {@link IDisposable}.
 */
export function combinedDisposable(...disposables: IDisposable[]): IDisposable {
  return toDisposable(() => dispose(disposables));
}

/**
 * Turn a function that implements dispose into an {@link IDisposable}.
 * Ensures the function is only called once.
 */
export function toDisposable(fn: () => void): IDisposable {
  return {
    dispose: createSingleCallFunction(fn),
  };
}

/**
 * A disposable that does nothing when it is disposed of.
 */
export const DisposableNone = Object.freeze<IDisposable>({ dispose() { /* noop */ } });

/**
 * Manages a collection of disposable values.
 */
export class DisposableStore implements IDisposable {
  private readonly _toDispose = new Set<IDisposable>();
  private _isDisposed = false;

  /**
   * Disposes of all registered disposables and marks this object as disposed.
   */
  public dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this.clear();
  }

  /**
   * Disposes of all registered disposables but do not mark this object as disposed.
   */
  public clear(): void {
    try {
      dispose(Array.from(this._toDispose.values()));
    } finally {
      this._toDispose.clear();
    }
  }

  /**
   * Adds a new {@link IDisposable disposable} to the collection.
   */
  public add<T extends IDisposable>(o: T): T {
    if (!o || o === DisposableNone) {
      return o;
    }
    if ((o as unknown as DisposableStore) === this) {
      throw new Error("Cannot register a disposable on itself!");
    }

    if (this._isDisposed) {
      console.warn("Adding disposable to already disposed store. Leaking object.");
      o.dispose();
    } else {
      this._toDispose.add(o);
    }
    return o;
  }
}

/**
 * Abstract base class for a {@link IDisposable disposable} object.
 *
 * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of.
 */
export abstract class Disposable implements IDisposable {
  protected readonly _store = new DisposableStore();

  public dispose(): void {
    this._store.dispose();
  }

  /**
   * Adds `o` to the collection of disposables managed by this object.
   */
  protected _register<T extends IDisposable>(o: T): T {
    if ((o as unknown as Disposable) === this) {
      throw new Error("Cannot register a disposable on itself!");
    }
    return this._store.add(o);
  }
}

/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a {@link MutableDisposable} on a {@link Disposable} to ensure it is automatically cleaned up.
 */
export class MutableDisposable<T extends IDisposable> implements IDisposable {
  private _value?: T;
  private _isDisposed = false;

  get value(): T | undefined {
    return this._isDisposed ? undefined : this._value;
  }

  set value(value: T | undefined) {
    if (this._isDisposed || value === this._value) {
      return;
    }
    this._value?.dispose();
    this._value = value;
  }

  /**
   * Resets the stored value and disposes of the previously stored value.
   */
  clear(): void {
    this.value = undefined;
  }

  dispose(): void {
    this._isDisposed = true;
    this._value?.dispose();
    this._value = undefined;
  }
}

/**
 * A disposable that counts references to an underlying disposable.
 * The underlying disposable is disposed when the reference count drops to 0.
 */
export class RefCountedDisposable {
  private _counter = 1;

  constructor(private readonly _disposable: IDisposable) {}

  acquire(): this {
    this._counter++;
    return this;
  }

  release(): this {
    if (--this._counter === 0) {
      this._disposable.dispose();
    }
    return this;
  }
}

/**
 * A map that manages the lifecycle of the values that it stores.
 * Values are disposed of when they are removed from the map.
 */
export class DisposableMap<K, V extends IDisposable = IDisposable> implements IDisposable {
  private readonly _store = new Map<K, V>();
  private _isDisposed = false;

  /**
   * Disposes of all stored values and marks this object as disposed.
   */
  dispose(): void {
    this._isDisposed = true;
    this.clearAndDisposeAll();
  }

  /**
   * Disposes of all stored values and clears the map, but DO NOT mark this object as disposed.
   */
  clearAndDisposeAll(): void {
    if (!this._store.size) {
      return;
    }

    try {
      dispose(Array.from(this._store.values()));
    } finally {
      this._store.clear();
    }
  }

  has(key: K): boolean {
    return this._store.has(key);
  }

  get size(): number {
    return this._store.size;
  }

  get(key: K): V | undefined {
    return this._store.get(key);
  }

  set(key: K, value: V, skipDisposeOnOverwrite = false): void {
    if (this._isDisposed) {
      console.warn("Setting disposable on already disposed map. Leaking object.");
      value.dispose();
      return;
    }

    if (!skipDisposeOnOverwrite) {
      this._store.get(key)?.dispose();
    }

    this._store.set(key, value);
  }

  /**
   * Deletes the value stored for `key` from this map and also disposes of it.
   */
  deleteAndDispose(key: K): void {
    this._store.get(key)?.dispose();
    this._store.delete(key);
  }

  keys(): IterableIterator<K> {
    return this._store.keys();
  }

  values(): IterableIterator<V> {
    return this._store.values();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this._store[Symbol.iterator]();
  }
}
