import path from "node:path";
import { app } from "electron";
import pkg from "../../../../package.json";

export interface IEnvironmentService {
  readonly userDataPath: string;
  readonly appName: string;
  readonly appVersion: string;
  readonly isDev: boolean;
  readonly nodeVersion: string;
  readonly chromeVersion: string;
  readonly electronVersion: string;
}

export class EnvironmentService implements IEnvironmentService {
  get userDataPath(): string {
    return path.join(app.getPath("userData"), "User");
  }

  get appName(): string {
    return pkg.name;
  }

  get appVersion(): string {
    return pkg.version;
  }

  get isDev(): boolean {
    return !app.isPackaged;
  }

  get nodeVersion(): string {
    return process.versions.node;
  }

  get chromeVersion(): string {
    return process.versions.chrome;
  }

  get electronVersion(): string {
    return process.versions.electron;
  }
}
