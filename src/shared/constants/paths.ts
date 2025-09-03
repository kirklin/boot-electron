import path from "node:path";
import { app } from "electron";

export const USER_DATA_DIR = path.join(app.getPath("userData"), "User");
