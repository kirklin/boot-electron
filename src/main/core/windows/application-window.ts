import path from "node:path";
import { BrowserWindow } from "electron";
import { Disposable, toDisposable } from "~/shared/lifecycle";

/**
 * A wrapper around `BrowserWindow` that manages its lifecycle and state.
 * This class represents a single managed window within the application.
 */
export class ApplicationWindow extends Disposable {
  private _win: BrowserWindow | undefined;

  get whenClosed(): Promise<void> {
    return new Promise((resolve) => {
      this._win?.once("closed", () => {
        resolve();
      });
    });
  }

  constructor() {
    super();

    this._win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "/preload.js"),
      },
    });

    this._register(toDisposable(() => this._win?.destroy()));
  }

  load() {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this._win?.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      this._win?.loadFile(path.join(__dirname, `../../../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
  }

  focus() {
    this._win?.focus();
  }

  openDevTools() {
    this._win?.webContents.openDevTools();
  }
}
