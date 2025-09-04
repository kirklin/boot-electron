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
 */
export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined;
export function dispose<T extends IDisposable>(disposables: T[]): T[];
export function dispose<T extends IDisposable>(disposables: readonly T[]): readonly T[];
export function dispose<T extends IDisposable>(arg: T | T[] | undefined): any {
  if (Array.isArray(arg)) {
    for (const d of arg) {
      if (d) {
        try {
          d.dispose();
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  } else if (arg) {
    try {
      arg.dispose();
    } catch (e) {
      console.error(e);
    }
    return arg;
  }
}

/**
 * Turn a function that implements dispose into an IDisposable.
 */
export function toDisposable(fn: () => void): IDisposable {
  return {
    dispose: fn,
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
   * Adds a new disposable to the collection.
   */
  public add<T extends IDisposable>(o: T): T {
    if (!o) {
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
 * Abstract base class for a disposable object.
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
