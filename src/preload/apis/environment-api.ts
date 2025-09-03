import { ipcRenderer } from "electron";
import { IpcChannels } from "~/shared/constants/ipc-channels";

export const environmentApi = {
  getEnvironment: () => ipcRenderer.invoke(IpcChannels.GET_ENVIRONMENT),
};
