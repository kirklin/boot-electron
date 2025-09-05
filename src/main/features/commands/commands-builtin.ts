import type { IWindowsMainService } from "~/main/core/windows-main-service";
import { app, BrowserWindow } from "electron";
import { container } from "tsyringe";

import { ServiceIdentifiers } from "~/main/core/service-identifiers";
import { CommandsRegistry } from "~/main/features/commands/commands-registry";
import { BuiltinCommands } from "~/shared/constants/commands";

export function registerBuiltinCommands(): void {
  const windowsMainService = container.resolve<IWindowsMainService>(ServiceIdentifiers.IWindowsMainService);

  CommandsRegistry.registerCommand(BuiltinCommands.QUIT, () => app.quit());
  CommandsRegistry.registerCommand(BuiltinCommands.CREATE_NEW_WINDOW, () => windowsMainService.open());

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
