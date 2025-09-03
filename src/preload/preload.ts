import { contextBridge } from "electron";
import { environmentApi } from "./apis/environment-api";
import { settingsApi } from "./apis/settings-api";
import { shortcutsApi } from "./apis/shortcuts-api";

const api = {
  environment: environmentApi,
  settings: settingsApi,
  shortcuts: shortcutsApi,
};

export type Api = typeof api;

contextBridge.exposeInMainWorld("api", api);
