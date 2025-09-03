import type { AppSettings } from "~/shared/types/settings";
import { ipcRenderer } from "electron";
import { IpcChannels } from "~/shared/constants/ipc-channels";

export const settingsApi = {
  get: (): Promise<AppSettings> => ipcRenderer.invoke(IpcChannels.GET_SETTINGS),
  save: (settings: AppSettings): Promise<void> => ipcRenderer.invoke(IpcChannels.SAVE_SETTINGS, settings),
};
