import type { IEnvironmentService } from "./environment-service";
import type { IDisposable } from "~/shared/lifecycle";
import { ipcMain } from "electron";
import { container } from "tsyringe";
import { IpcChannels } from "~/shared/constants/ipc-channels";
import { toDisposable } from "~/shared/lifecycle";
import { ServiceIdentifiers } from "../../core/service-identifiers";

export function registerEnvironmentIpc(): IDisposable {
  const environmentService = container.resolve<IEnvironmentService>(
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

  return toDisposable(() => {
    ipcMain.removeHandler(IpcChannels.GET_ENVIRONMENT);
  });
}
