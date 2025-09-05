import { contextBridge } from "electron";
import { commandsApi } from "./apis/commands-api";
import { environmentApi } from "./apis/environment-api";
import { settingsApi } from "./apis/settings-api";
import { shortcutsApi } from "./apis/shortcuts-api";

const api = {
  commands: commandsApi,
  environment: environmentApi,
  settings: settingsApi,
  shortcuts: shortcutsApi,
};

export type Api = typeof api;

contextBridge.exposeInMainWorld("api", api);
