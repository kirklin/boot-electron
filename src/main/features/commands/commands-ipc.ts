import type { CommandsService } from "~/main/features/commands/commands-service";
import type { IDisposable } from "~/shared/lifecycle";
import { ipcMain } from "electron";
import { container } from "tsyringe";
import { ServiceIdentifiers } from "~/main/core/service-identifiers";
import { IpcChannels } from "~/shared/constants/ipc-channels";

import { toDisposable } from "~/shared/lifecycle";

export function registerCommandsIpc(): IDisposable {
  const commandsService = container.resolve<CommandsService>(ServiceIdentifiers.ICommandService);

  ipcMain.handle(IpcChannels.COMMANDS_EXECUTE, (event, commandId, ...args) => {
    return commandsService.executeCommand(commandId, ...args);
  });

  return toDisposable(() => {
    ipcMain.removeHandler(IpcChannels.COMMANDS_EXECUTE);
  });
}
