import { ipcRenderer } from "electron";
import { IpcChannels } from "~/shared/constants/ipc-channels";

export const commandsApi = {
  executeCommand: (commandId: string, ...args: any[]) => {
    return ipcRenderer.invoke(IpcChannels.COMMANDS_EXECUTE, commandId, ...args);
  },
};
