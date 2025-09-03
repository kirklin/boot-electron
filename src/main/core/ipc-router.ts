import { registerSettingsIpc } from "~/main/features/settings/settings-ipc";

export class IpcRouter {
  initialize() {
    registerSettingsIpc();
    console.log("IPC Router Initialized");
  }
}
