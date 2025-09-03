import type { IEnvironmentService } from "~/main/core/environment-service";
import type { AppSettings } from "~/shared/types/settings";
import fs from "node:fs/promises";
import path from "node:path";
import { container } from "~/main/core/container";
import { ServiceIdentifiers } from "~/main/core/service-identifiers";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
};

export class SettingsService {
  private readonly envService: IEnvironmentService;
  private readonly settingsFile: string;

  constructor() {
    this.envService = container.get<IEnvironmentService>(ServiceIdentifiers.IEnvironmentService);
    this.settingsFile = path.join(this.envService.userDataPath, "settings.json");
  }

  async getSettings(): Promise<AppSettings> {
    try {
      await fs.mkdir(this.envService.userDataPath, { recursive: true });
      await fs.access(this.settingsFile);
      const fileContent = await fs.readFile(this.settingsFile, "utf-8");
      return JSON.parse(fileContent) as AppSettings;
    } catch {
      await fs.writeFile(this.settingsFile, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await fs.writeFile(this.settingsFile, JSON.stringify(settings, null, 2));
  }
}
