import { contextBridge } from "electron";
import { environmentApi } from "./apis/environment-api";
import { settingsApi } from "./apis/settings-api";

const api = {
  environment: environmentApi,
  settings: settingsApi,
};

export type Api = typeof api;

contextBridge.exposeInMainWorld("api", api);
