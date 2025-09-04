import type { IEnvironmentService } from "~/main/features/environment/environment-service";
import type { AppSettings } from "~/shared/types/settings";
import fs from "node:fs/promises";
import path from "node:path";
import { inject, singleton } from "tsyringe";
import { ServiceIdentifiers } from "~/main/core/service-identifiers";
import { Disposable } from "~/shared/lifecycle";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
};

export interface ISettingsService {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;
}

@singleton()
export class SettingsService extends Disposable implements ISettingsService {
  private readonly settingsFile: string;

  constructor(
    @inject(ServiceIdentifiers.IEnvironmentService) private readonly envService: IEnvironmentService,
  ) {
    super();
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
