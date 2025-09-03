import type { AppSettings } from "~/shared/types/settings";
import { ipcMain } from "electron";
import { IpcChannels } from "~/shared/constants/ipc-channels";
import { SettingsService } from "./settings-service";

export function registerSettingsIpc() {
  const settingsService = new SettingsService();

  ipcMain.handle(IpcChannels.GET_SETTINGS, () => {
    return settingsService.getSettings();
  });

  ipcMain.handle(IpcChannels.SAVE_SETTINGS, (_, settings: AppSettings) => {
    return settingsService.saveSettings(settings);
  });
}
