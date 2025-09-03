import type { ISettingsService } from "./settings-service";
import type { AppSettings } from "~/shared/types/settings";
import { ipcMain } from "electron";
import { IpcChannels } from "~/shared/constants/ipc-channels";
import { container } from "../../core/container";
import { ServiceIdentifiers } from "../../core/service-identifiers";

export function registerSettingsIpc() {
  const settingsService = container.get<ISettingsService>(
    ServiceIdentifiers.ISettingsService,
  );

  ipcMain.handle(IpcChannels.GET_SETTINGS, () => {
    return settingsService.getSettings();
  });

  ipcMain.handle(IpcChannels.SAVE_SETTINGS, (_, settings: AppSettings) => {
    return settingsService.saveSettings(settings);
  });
}
