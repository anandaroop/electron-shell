import { app, BrowserWindow } from "electron";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

import { app as expressApp } from "./server";

const expressPort = Number(process.env.EXPRESS_PORT) || 3001;
expressApp.listen(expressPort, () => {
  console.log(`Express server listening on http://localhost:${expressPort}`);
});

const isDev = !app.isPackaged;

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
