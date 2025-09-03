import path from "node:path";
import { app } from "electron";

export interface IEnvironmentService {
  readonly userDataPath: string;
}

export class EnvironmentService implements IEnvironmentService {
  get userDataPath(): string {
    return path.join(app.getPath("userData"), "User");
  }
}
