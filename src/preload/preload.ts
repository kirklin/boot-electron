import { contextBridge } from "electron";
import { settingsApi } from "./apis/settings-api";
import { versionsApi } from "./apis/versions-api";

const api = {
  versions: versionsApi,
  settings: settingsApi,
};

export type Api = typeof api;

contextBridge.exposeInMainWorld("api", api);
