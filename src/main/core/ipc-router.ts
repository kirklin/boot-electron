import { registerSettingsIpc } from "~/main/features/settings/settings-ipc";
import { registerEnvironmentIpc } from "../features/environment/environment-ipc";

export class IpcRouter {
  initialize() {
    registerSettingsIpc();
    registerEnvironmentIpc();
    console.log("IPC Router Initialized");
  }
}
