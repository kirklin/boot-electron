import type { IEnvironmentService } from "./environment-service";
import { ipcMain } from "electron";
import { IpcChannels } from "~/shared/constants/ipc-channels";
import { container } from "../../core/container";
import { ServiceIdentifiers } from "../../core/service-identifiers";

export function registerEnvironmentIpc() {
  const environmentService = container.get<IEnvironmentService>(
    ServiceIdentifiers.IEnvironmentService,
  );

  ipcMain.handle(IpcChannels.GET_ENVIRONMENT, () => {
    return {
      appName: environmentService.appName,
      appVersion: environmentService.appVersion,
      isDev: environmentService.isDev,
      nodeVersion: environmentService.nodeVersion,
      chromeVersion: environmentService.chromeVersion,
      electronVersion: environmentService.electronVersion,
    };
  });
}
