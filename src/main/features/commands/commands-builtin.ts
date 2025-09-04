import { app, BrowserWindow } from "electron";
import { CommandsRegistry } from "~/main/features/commands/commands-registry";
import { BuiltinCommands } from "~/shared/constants/commands";

export function registerBuiltinCommands(): void {
  CommandsRegistry.registerCommand(BuiltinCommands.QUIT, () => app.quit());

  CommandsRegistry.registerCommand(BuiltinCommands.TOGGLE_DEV_TOOLS, () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.toggleDevTools();
    }
  });

  CommandsRegistry.registerCommand(BuiltinCommands.RELOAD, () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.reload();
    }
  });
}
