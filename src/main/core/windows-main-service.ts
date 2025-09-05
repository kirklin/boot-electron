import { singleton } from "tsyringe";
import { Disposable, DisposableMap } from "~/shared/lifecycle";
import { ApplicationWindow } from "./windows/application-window";

export interface IWindowsMainService {
  readonly _serviceBrand: undefined;
  open: (options?: any) => Promise<void>;
}

@singleton()
export class WindowsMainService extends Disposable implements IWindowsMainService {
  declare readonly _serviceBrand: undefined;

  private readonly windows = this._register(new DisposableMap<number, ApplicationWindow>());

  constructor() {
    super();
  }

  async open(_options?: any): Promise<void> {
    const newWindow = new ApplicationWindow();
    const windowId = Math.random(); // Temporary ID, will improve later
    this.windows.set(windowId, newWindow);

    newWindow.whenClosed.then(() => {
      this.windows.deleteAndDispose(windowId);
    });

    newWindow.load();
    newWindow.focus();
    newWindow.openDevTools(); // For debugging, can be conditional later
  }
}
