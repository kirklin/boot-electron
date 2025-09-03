import type { Keybinding } from "~/shared/types/shortcuts";
import { ipcRenderer } from "electron";
import { IpcChannels } from "~/shared/constants/ipc-channels";

export const shortcutsApi = {
  getKeybindings: (): Promise<Keybinding[]> =>
    ipcRenderer.invoke(IpcChannels.GET_KEYBINDINGS),
};
