import { app, BrowserWindow, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  HealthPingRequestSchema,
  IPC_CHANNELS,
  OpenExternalRequestSchema,
  errorResponse,
  isAllowedExternalUrl,
  successResponse,
  type AppInfo,
  type DesktopResponse,
  type HealthPingResult,
  type OpenExternalResult
} from "../shared/ipc-contracts.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

function environment(): AppInfo["environment"] {
  if (process.env.NODE_ENV === "test") {
    return "test";
  }

  return process.env.ELECTRON_RENDERER_URL ? "development" : "production";
}

function appInfo(): AppInfo {
  return {
    app_name: app.getName(),
    app_version: app.getVersion(),
    platform: process.platform,
    environment: environment()
  };
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.appGetInfo, (): DesktopResponse<AppInfo> => successResponse(appInfo()));

  ipcMain.handle(IPC_CHANNELS.healthPing, (_event, payload: unknown): DesktopResponse<HealthPingResult> => {
    const parsed = HealthPingRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse("schema_violation", "Invalid health ping request.");
    }

    return successResponse({
      status: "ok",
      timestamp: new Date().toISOString(),
      ...(parsed.data?.request_id ? { request_id: parsed.data.request_id } : {})
    });
  });

  ipcMain.handle(IPC_CHANNELS.shellOpenExternal, async (_event, payload: unknown): Promise<DesktopResponse<OpenExternalResult>> => {
    const parsed = OpenExternalRequestSchema.safeParse(payload);
    if (!parsed.success || !isAllowedExternalUrl(parsed.data.url)) {
      return errorResponse("invalid_external_url", "Only HTTPS URLs can be opened externally.");
    }

    await shell.openExternal(parsed.data.url);
    return successResponse({ opened: true });
  });
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    title: "Fashion Design AI",
    show: false,
    backgroundColor: "#f7f4ef",
    webPreferences: {
      preload: join(currentDir, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const currentUrl = mainWindow.webContents.getURL();
    if (navigationUrl !== currentUrl) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) {
      void shell.openExternal(url);
    }

    return { action: "deny" };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(currentDir, "../renderer/index.html"));
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    registerIpcHandlers();
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
