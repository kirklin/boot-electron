import type { IShortcutsService } from "./shortcuts-service";
import { ipcMain } from "electron";
import { IpcChannels } from "~/shared/constants/ipc-channels";
import { container } from "../../core/container";
import { ServiceIdentifiers } from "../../core/service-identifiers";

export function registerShortcutsIpc() {
  const shortcutsService = container.get<IShortcutsService>(
    ServiceIdentifiers.IShortcutsService,
  );

  ipcMain.handle(IpcChannels.GET_KEYBINDINGS, () => {
    return shortcutsService.getKeybindings();
  });
}
