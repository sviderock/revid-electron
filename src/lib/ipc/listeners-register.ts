import type { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
  addThemeEventListeners();
}
