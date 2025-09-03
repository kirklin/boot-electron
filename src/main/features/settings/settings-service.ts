import type { AppSettings } from "~/shared/types/settings";
import fs from "node:fs/promises";
import path from "node:path";
import { USER_DATA_DIR } from "~/shared/constants/paths";

const SETTINGS_FILE = path.join(USER_DATA_DIR, "settings.json");

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
};

export class SettingsService {
  async getSettings(): Promise<AppSettings> {
    try {
      await fs.mkdir(USER_DATA_DIR, { recursive: true });
      await fs.access(SETTINGS_FILE);
      const fileContent = await fs.readFile(SETTINGS_FILE, "utf-8");
      return JSON.parse(fileContent) as AppSettings;
    } catch {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  }
}
