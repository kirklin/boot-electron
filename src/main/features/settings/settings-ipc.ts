import type { ISettingsService } from "./settings-service";
import type { IDisposable } from "~/shared/lifecycle";
import type { AppSettings } from "~/shared/types/settings";
import { ipcMain } from "electron";
import { container } from "tsyringe";
import { IpcChannels } from "~/shared/constants/ipc-channels";
import { toDisposable } from "~/shared/lifecycle";
import { ServiceIdentifiers } from "../../core/service-identifiers";

export function registerSettingsIpc(): IDisposable {
  const settingsService = container.resolve<ISettingsService>(
    ServiceIdentifiers.ISettingsService,
  );

  ipcMain.handle(IpcChannels.GET_SETTINGS, () => {
    return settingsService.getSettings();
  });

  ipcMain.handle(IpcChannels.SAVE_SETTINGS, (_, settings: AppSettings) => {
    return settingsService.saveSettings(settings);
  });

  return toDisposable(() => {
    ipcMain.removeHandler(IpcChannels.GET_SETTINGS);
    ipcMain.removeHandler(IpcChannels.SAVE_SETTINGS);
  });
}
