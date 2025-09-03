import { app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import { container } from "./core/container";
import { EnvironmentService } from "./core/environment-service";
import { IpcRouter } from "./core/ipc-router";
import { ServiceIdentifiers } from "./core/service-identifiers";
import { WindowManager } from "./core/window-manager";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const windowManager = new WindowManager();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  // Register all services before initializing anything else
  container.register(ServiceIdentifiers.IEnvironmentService, new EnvironmentService());

  windowManager.createWindow();

  const ipcRouter = new IpcRouter();
  ipcRouter.initialize();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createWindow();
  }
});
