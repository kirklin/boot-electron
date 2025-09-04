import type { IShortcutsService } from "./shortcuts-service";
import type { IDisposable } from "~/shared/lifecycle";
import { ipcMain } from "electron";
import { container } from "tsyringe";
import { IpcChannels } from "~/shared/constants/ipc-channels";
import { toDisposable } from "~/shared/lifecycle";
import { ServiceIdentifiers } from "../../core/service-identifiers";

export function registerShortcutsIpc(): IDisposable {
  const shortcutsService = container.resolve<IShortcutsService>(
    ServiceIdentifiers.IShortcutsService,
  );

  ipcMain.handle(IpcChannels.GET_KEYBINDINGS, () => {
    return shortcutsService.getKeybindings();
  });

  return toDisposable(() => {
    ipcMain.removeHandler(IpcChannels.GET_KEYBINDINGS);
  });
}
