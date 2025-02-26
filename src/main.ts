import { app, BrowserWindow } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { Client } from "whatsapp-web-electron.js";
import pie from "puppeteer-in-electron";
import puppeteer from "puppeteer-core";
import ffmpeg from "fluent-ffmpeg";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

pie.initialize(app);

const createWindow = async () => {
  console.log(123);
  // Create the browser window.
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  pie.connect(app, puppeteer as any).then((pieBrowser) => {
    console.log(123123);
    const client = new Client(pieBrowser as any, window);

    // No need to listen for "qr" event as you can scan
    // the qr code directly in electron window

    client.on("ready", () => {
      console.log("Client is ready!");
    });

    client.on("message", (msg) => {
      if (msg.body == "!ping") {
        msg.reply("pong");
      }
    });

    client.initialize();

    // Open the DevTools.
    // window.webContents.openDevTools();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// console.log("init ws WA client");
// client.initialize();

// client.on("loading_screen", (percent, message) => {
//   console.log("LOADING SCREEN", percent, message);
// });

// client.on("authenticated", () => {
//   console.log("AUTHENTICATED");
// });

// client.on("auth_failure", (msg) => {
//   // Fired if session restore was unsuccessful
//   console.error("AUTHENTICATION FAILURE", msg);
// });

// client.on("disconnected", (reason) => {
//   console.log("Client was logged out", reason);
// });

// client.on("ready", async () => {
//   client.pupPage?.on("pageerror", function (err) {
//     console.log("Page error: " + err.toString());
//   });
//   client.pupPage?.on("error", function (err) {
//     console.log("Page error: " + err.toString());
//   });

//   // ws.addEventListener('message', async (event) => {
//   // const data = parseJson<WSServerEvent>(event.data);
//   // if (!data) return;

//   // switch (data.type) {
//   // 	case 'request_chats':
//   // 		const chats = await client.getChats();
//   // 		wsSend({ type: 'response_charts', chats });
//   // 		break;

//   // 	case 'request_chat_messages': {
//   // 		const chat = await client.getChatById(data.chatId);
//   // 		await chat.syncHistory();
//   // 		const messages = await chat.fetchMessages({ limit: 100 });

//   // 		console.log('fetched messages', messages.length);

//   // 		const videoMessages = messages.filter(
//   // 			(m) => m.hasMedia && m.type === waw.MessageTypes.VIDEO,
//   // 		);

//   // 		console.log('found video messages', videoMessages.length);

//   // 		for (let i = 0; i < videoMessages.length; i++) {
//   // 			const video = videoMessages[i]!;
//   // 			console.log('found media');
//   // 			const media = await video.downloadMedia();
//   // 			if (media) {
//   // 				console.log('saving');
//   // 				await saveFile(media);
//   // 			}
//   // 			try {
//   // 			} catch (error) {
//   // 				console.log(error);
//   // 			}
//   // 		}
//   // 		break;
//   // 	}

//   // 	default:
//   // 		break;
//   // }
//   // });
// });

// client.on("qr", (qr) => {
//   console.log("got qr code", qr);
// });

// client.on("message", async (msg) => {
//   console.log("got message");
//   // }
// });

// // async function saveFile(data: waw.MessageMedia | undefined) {
// // 	if (!data) return;

// // 	const filename = data.filename ?? `${Bun.randomUUIDv7()}.mp4`;
// // 	const path = `./videos/${filename}`;
// // 	const file = Bun.file(path, { type: data.mimetype });
// // 	await Bun.write(file, Buffer.from(data.data, 'base64'));
// // 	/* then upload oder directly download your file / blob depending on your needs */
// // }
