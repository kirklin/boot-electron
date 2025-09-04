import { registerSettingsIpc } from "~/main/features/settings/settings-ipc";
import { Disposable } from "~/shared/lifecycle";
import { registerEnvironmentIpc } from "../features/environment/environment-ipc";
import { registerShortcutsIpc } from "../features/shortcuts/shortcuts-ipc";

export class IpcRouter extends Disposable {
  initialize() {
    const settingsIpcDisposable = registerSettingsIpc();
    this._register(settingsIpcDisposable);

    const environmentIpcDisposable = registerEnvironmentIpc();
    this._register(environmentIpcDisposable);

    const shortcutsIpcDisposable = registerShortcutsIpc();
    this._register(shortcutsIpcDisposable);

    console.log("IPC Router Initialized");
  }
}
