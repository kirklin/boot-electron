import type { IEnvironmentService } from "~/main/features/environment/environment-service";
import type { Keybinding } from "~/shared/types/shortcuts";
import fs from "node:fs/promises";
import path from "node:path";
import { app, BrowserWindow, globalShortcut } from "electron";
import { container } from "~/main/core/container";
import { ServiceIdentifiers } from "~/main/core/service-identifiers";

export interface IShortcutsService {
  initialize: () => Promise<void>;
  getKeybindings: () => Promise<Keybinding[]>;
  registerAll: () => void;
}

const DEFAULT_KEYBINDINGS: Keybinding[] = [
  { name: "Toggle Developer Tools", key: "CmdOrCtrl+Shift+I", command: "app.toggle-dev-tools", source: "default" },
  { name: "Reload", key: "CmdOrCtrl+R", command: "app.reload", source: "default" },
  { name: "Quit", key: "CmdOrCtrl+Q", command: "app.quit", source: "default" },
];

export class ShortcutsService implements IShortcutsService {
  private readonly envService: IEnvironmentService;
  private readonly keybindingsFile: string;
  private keybindings: Keybinding[] = [];

  constructor() {
    this.envService = container.get<IEnvironmentService>(ServiceIdentifiers.IEnvironmentService);
    this.keybindingsFile = path.join(this.envService.userDataPath, "keybindings.json");
  }

  async initialize(): Promise<void> {
    await this.loadKeybindings();
  }

  private async loadKeybindings(): Promise<void> {
    try {
      await fs.access(this.keybindingsFile);
      const fileContent = await fs.readFile(this.keybindingsFile, "utf-8");
      const userKeybindings = (JSON.parse(fileContent) as Omit<Keybinding, "source">[]).map(b => ({ ...b, source: "user" as const }));
      this.keybindings = this.mergeKeybindings(DEFAULT_KEYBINDINGS, userKeybindings);
    } catch {
      this.keybindings = DEFAULT_KEYBINDINGS;
      await fs.writeFile(this.keybindingsFile, JSON.stringify(this.keybindings, null, 2));
    }
  }

  private mergeKeybindings(defaults: Keybinding[], user: Keybinding[]): Keybinding[] {
    const userBindingsMap = new Map(user.map(b => [b.command, b]));
    const merged = defaults.map((defaultBinding) => {
      return userBindingsMap.get(defaultBinding.command) || defaultBinding;
    });

    return merged;
  }

  async getKeybindings(): Promise<Keybinding[]> {
    return this.keybindings;
  }

  registerAll(): void {
    if (this.keybindings.length === 0) {
      console.warn("No keybindings loaded, skipping registration.");
      return;
    }

    globalShortcut.unregisterAll();
    for (const binding of this.keybindings) {
      const success = globalShortcut.register(binding.key, () => {
        this.executeCommand(binding.command);
      });
      if (!success) {
        console.error(`Failed to register shortcut: ${binding.key}`);
      }
    }
    console.log("Shortcuts registered successfully.");
  }

  private executeCommand(command: string): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    switch (command) {
      case "app.toggle-dev-tools":
        if (focusedWindow) {
          focusedWindow.webContents.toggleDevTools();
        }
        break;
      case "app.reload":
        if (focusedWindow) {
          focusedWindow.reload();
        }
        break;
      case "app.quit":
        app.quit();
        break;
    }
  }
}
