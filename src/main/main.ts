import { app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import { DisposableStore } from "../shared/lifecycle";
import { container } from "./core/container";
import { IpcRouter } from "./core/ipc-router";
import { ServiceIdentifiers } from "./core/service-identifiers";
import { WindowManager } from "./core/window-manager";
import { registerBuiltinCommands } from "./features/commands/commands-builtin";
import { CommandsService } from "./features/commands/commands-service";
import { EnvironmentService } from "./features/environment/environment-service";
import { SettingsService } from "./features/settings/settings-service";
import { ShortcutsService } from "./features/shortcuts/shortcuts-service";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const disposables = new DisposableStore();
app.on("will-quit", () => disposables.dispose());

const windowManager = new WindowManager();
disposables.add(windowManager);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // Register all services before initializing anything else
  const environmentService = new EnvironmentService();
  disposables.add(environmentService);
  container.register(ServiceIdentifiers.IEnvironmentService, environmentService);

  const settingsService = new SettingsService();
  disposables.add(settingsService);
  container.register(ServiceIdentifiers.ISettingsService, settingsService);

  const commandService = new CommandsService();
  disposables.add(commandService);
  container.register(ServiceIdentifiers.ICommandService, commandService);

  const shortcutsService = new ShortcutsService();
  disposables.add(shortcutsService);
  container.register(ServiceIdentifiers.IShortcutsService, shortcutsService);

  // Initialize services
  await shortcutsService.initialize();

  registerBuiltinCommands();

  const ipcRouter = new IpcRouter();
  disposables.add(ipcRouter);
  ipcRouter.initialize();

  windowManager.createWindow();

  // Register all shortcuts after initialization
  shortcutsService.registerAll();
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
