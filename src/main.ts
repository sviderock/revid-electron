import registerListeners from "@/lib/ipc/listeners-register";
import console from "console";
import { BrowserWindow, app, ipcMain, screen } from "electron";
import path from "path";
import puppeteer from "puppeteer";
import * as qrcode from "qrcode";
import { Client } from "whatsapp-web.js";

let mainWindow: BrowserWindow | null = null;
let whatsappClient: Client | null = null;

function createWindow() {
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

  registerListeners(mainWindow);

  // Load a basic HTML file
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "bottom" });
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Initialize WhatsApp client
  initWhatsApp();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function initWhatsApp() {
  try {
    whatsappClient = new Client({
      // authStrategy: new LocalAuth({ dataPath: sessionDir }),
      puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
        ],
      },
    });

    whatsappClient.on("qr", async (qr) => {
      console.log("QR RECEIVED");

      try {
        // Convert QR to data URL
        const qrDataURL = await qrcode.toDataURL(qr);

        // Send QR code to renderer process
        if (mainWindow) {
          mainWindow.webContents.send("qr-code", qrDataURL);
        }
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    });

    whatsappClient.on("ready", () => {
      console.log("Client is ready!");
      if (mainWindow) {
        mainWindow.webContents.send("whatsapp-ready");
      }
    });

    whatsappClient.on("authenticated", () => {
      console.log("AUTHENTICATED");
      if (mainWindow) {
        mainWindow.webContents.send("whatsapp-authenticated");
      }
    });

    whatsappClient.on("auth_failure", (msg) => {
      console.error("AUTHENTICATION FAILURE", msg);
      if (mainWindow) {
        mainWindow.webContents.send("whatsapp-auth-failure", msg);
      }
    });

    whatsappClient.on("message", async (msg) => {
      console.log("MESSAGE RECEIVED:", msg.body);

      // Example response
      if (msg.body.toLowerCase() === "!ping") {
        await msg.reply("pong");
      }

      // Forward message to renderer
      if (mainWindow) {
        mainWindow.webContents.send("whatsapp-message", {
          from: msg.from,
          body: msg.body,
          timestamp: msg.timestamp,
        });
      }
    });

    // Initialize WhatsApp client
    whatsappClient.initialize().catch((err) => {
      console.error("Failed to initialize WhatsApp client:", err);
    });
  } catch (error) {
    console.error("Error setting up WhatsApp client:", error);
  }
}

// IPC handlers for communication with renderer
ipcMain.on("send-message", async (event, data) => {
  try {
    if (whatsappClient && whatsappClient.info) {
      await whatsappClient.sendMessage(data.to, data.message);
      event.reply("message-sent", { success: true });
    } else {
      event.reply("message-sent", {
        success: false,
        error: "WhatsApp client not ready",
      });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    event.reply("message-sent", {
      success: false,
      error: (error as unknown as any)?.message,
    });
  }
});

app.on("ready", createWindow);

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Set up IPC handler
ipcMain.handle("get-data", async (event, arg) => {
  console.log("Received request with argument:", arg);

  // Simulate some async operation
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    message: "Response from main process",
    timestamp: new Date().toISOString(),
    receivedArg: arg,
  };
});
