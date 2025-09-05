import { app } from "electron";
import { singleton } from "tsyringe";
import { Disposable } from "~/shared/lifecycle";

/**
 * The main service for managing the application's lifecycle.
 */
export interface ILifecycleMainService {
  readonly _serviceBrand: undefined;

  /**
   * Quits the application.
   */
  quit: () => Promise<void>;

  /**
   * Relaunches the application.
   */
  relaunch: () => Promise<void>;
}

@singleton()
export class LifecycleMainService extends Disposable implements ILifecycleMainService {
  declare readonly _serviceBrand: undefined;

  constructor() {
    super();
  }

  async quit(): Promise<void> {
    app.quit();
  }

  async relaunch(): Promise<void> {
    app.relaunch();
    app.quit();
  }
}
