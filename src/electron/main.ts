import { db } from "@/db";
import { createContext, type Context } from "@/electron/context";
import createWhatsappHandler from "@/electron/createWhatsappHandler";
import { router } from "@/electron/trpc";
import { WHATSAPP_CLIENT_EVENTS } from "@/electron/whatsapp-events";
import { app, BrowserWindow, screen } from "electron";
import Logger from "electron-log";
import path from "path";
import puppeteer from "puppeteer";
import { createIPCHandler } from "trpc-electron/main";
import { Client, LocalAuth } from "whatsapp-web.js";

export const STORAGE_DIR = MAIN_WINDOW_VITE_DEV_SERVER_URL
  ? path.join(process.cwd(), "temp")
  : __dirname;

Logger.initialize({ preload: true });
Logger.transports.file.resolvePathFn = (variables) => {
  return path.join(STORAGE_DIR, `${variables.fileName}`);
};

export const logPath = Logger.transports.file.getFile().path;

let mainWindow: BrowserWindow | null = null;
let whatsappClient: Client | null = null;

async function createWindow() {
  // Use workAreaSize to avoid taskbar overlap
  const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  const width = 800;
  const height = workAreaSize.height;
  const x = workAreaSize.width - width;
  const y = 0;

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load a basic HTML file
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "bottom" });
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    mainWindow.webContents.openDevTools({ mode: "bottom" });
  }

  try {
    whatsappClient = new Client({
      authStrategy: new LocalAuth({
        dataPath: STORAGE_DIR,
      }),
      webVersionCache: {
        type: "local",
        path: path.join(STORAGE_DIR, "whatsapp_www_cache"),
      },
      puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          // "--disable-gpu",
        ],
      },
    });

    whatsappClient.setMaxListeners(WHATSAPP_CLIENT_EVENTS.length);
    whatsappClient.initialize().catch((err) => {
      console.error("Failed to initialize WhatsApp client:", err);
    });

    const trpcContext: Context = { whatsappClient: whatsappClient!, db };

    createWhatsappHandler(trpcContext);
    createIPCHandler({
      router,
      windows: [mainWindow],
      createContext: (opts) => createContext(trpcContext),
    });
  } catch (error) {
    console.error("Error setting up WhatsApp client:", error);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  try {
    createWindow();
  } catch (error) {
    Logger.error(error);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
