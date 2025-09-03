import { registerSettingsIpc } from "~/main/features/settings/settings-ipc";
import { registerEnvironmentIpc } from "../features/environment/environment-ipc";
import { registerShortcutsIpc } from "../features/shortcuts/shortcuts-ipc";

export class IpcRouter {
  initialize() {
    registerSettingsIpc();
    registerEnvironmentIpc();
    registerShortcutsIpc();
    console.log("IPC Router Initialized");
  }
}
