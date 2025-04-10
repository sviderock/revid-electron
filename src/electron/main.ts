import { db } from "@/db";
import { router, trpcCreateCaller } from "@/electron/trpc";
import { createContext, type Context } from "@/electron/trpc/context";
import { WHATSAPP_CLIENT_EVENTS } from "@/electron/trpc/whatsapp-events";
import { app, BrowserWindow, screen } from "electron";
import Logger from "electron-log";
import path from "path";
import puppeteer from "puppeteer";
import { createIPCHandler } from "trpc-electron/main";
import { Client, LocalAuth } from "whatsapp-web.js";

Logger.initialize({ preload: true });
Logger.transports.file.resolvePathFn = (variables) => {
  return path.join(variables.libraryDefaultDir, `${variables.fileName}`);
};

export const logPath = Logger.transports.file.getFile().path;
console.log({ logPath });

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

  // Initialize WhatsApp client
  try {
    const sessionDir =
      process.env.NODE_ENV === "production" ? path.join(__dirname, "session") : __dirname;

    whatsappClient = new Client({
      authStrategy: new LocalAuth({ dataPath: sessionDir }),
      puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          // "--disable-gpu",
          "--disable-dev-shm-usage",
        ],
      },
    });

    whatsappClient.setMaxListeners(WHATSAPP_CLIENT_EVENTS.length);

    // Initialize WhatsApp client
    whatsappClient.initialize().catch((err) => {
      console.error("Failed to initialize WhatsApp client:", err);
    });

    whatsappClient.on("qr", async (code) => {
      await trpcCaller.updateQRCode(code);
    });

    const trpcContext: Context = { whatsappClient: whatsappClient!, db };
    const trpcCaller = trpcCreateCaller(trpcContext);

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
