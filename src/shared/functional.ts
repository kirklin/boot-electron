/* ---------------------------------------------------------------------------------------------
 * A collection of general-purpose functional utilities.
 *-------------------------------------------------------------------------------------------- */

/**
 * Wraps a function to ensure it is called only once.
 *
 * @param fn The function to be called once.
 * @param fnDidRunCallback An optional callback that is executed after `fn` has been called.
 * @returns A new function that will only call `fn` the first time it is invoked.
 *          Subsequent calls will return the result of the first call.
 */
export function createSingleCallFunction<T extends (...args: any[]) => any>(
  fn: T,
  fnDidRunCallback?: () => void,
): T {
  let didCall = false;
  let result: ReturnType<T>;

  return function (...args: Parameters<T>) {
    if (didCall) {
      return result;
    }

    didCall = true;
    try {
      result = fn(...args);
      return result;
    } finally {
      fnDidRunCallback?.();
    }
  } as T;
}
