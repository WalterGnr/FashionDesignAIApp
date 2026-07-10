import { app, BrowserWindow, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  CreateRendersRequestSchema,
  CreateRendersResultSchema,
  HealthPingRequestSchema,
  IPC_CHANNELS,
  ListRendersRequestSchema,
  OpenExternalRequestSchema,
  RenderAssetDataUrlRequestSchema,
  RenderAssetDataUrlResultSchema,
  RenderJobRequestSchema,
  RenderJobSchema,
  SyncDesignVersionRequestSchema,
  SyncDesignVersionResultSchema,
  errorResponse,
  isAllowedExternalUrl,
  successResponse,
  type AppInfo,
  type DesktopResponse,
  type HealthPingResult,
  type OpenExternalResult,
  type RenderAssetDataUrlResult,
  type RenderJob,
  type SyncDesignVersionResult
} from "../shared/ipc-contracts.js";
import { z } from "zod";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
const apiBaseUrl = process.env.FASHION_API_URL ?? "http://127.0.0.1:8000";
const MAX_RENDER_ASSET_BYTES = 25 * 1024 * 1024;

class BackendRequestError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

async function backendJson(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      },
      signal: AbortSignal.timeout(20_000)
    });
  } catch (error) {
    throw new BackendRequestError("backend_unavailable", "The local design service is unavailable.");
  }

  if (!response.ok) {
    let message = `The design service returned HTTP ${response.status}.`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep the safe HTTP status message when the response has no JSON body.
    }
    throw new BackendRequestError(`backend_http_${response.status}`, message);
  }
  return response.json();
}

function backendError(error: unknown): DesktopResponse<never> {
  if (error instanceof BackendRequestError) {
    return errorResponse(error.code, error.message);
  }
  return errorResponse("backend_response_invalid", "The design service returned an invalid response.");
}

const BackendDesignReferenceSchema = z
  .object({
    id: z.string().uuid(),
    current_version_id: z.string().uuid()
  })
  .passthrough();

const BackendVersionReferenceSchema = z
  .object({
    id: z.string().uuid(),
    design_id: z.string().uuid()
  })
  .passthrough();

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

  ipcMain.handle(
    IPC_CHANNELS.backendSyncDesignVersion,
    async (_event, payload: unknown): Promise<DesktopResponse<SyncDesignVersionResult>> => {
      const parsed = SyncDesignVersionRequestSchema.safeParse(payload);
      if (!parsed.success) {
        return errorResponse("schema_violation", "Invalid design version sync request.");
      }
      const request = parsed.data;
      const versionPayload = {
        ...(request.parent_backend_version_id ? { parent_version_id: request.parent_backend_version_id } : {}),
        source: request.source,
        created_by_actor: "designer",
        raw_input_ref: request.local_version_id,
        change_summary: request.change_summary,
        spec_snapshot: request.spec_snapshot,
        locked_fields_snapshot: request.locked_fields_snapshot,
        operation_ids: request.operation_ids
      };
      try {
        let result: SyncDesignVersionResult;
        if (!request.backend_design_id) {
          const response = BackendDesignReferenceSchema.parse(
            await backendJson("/designs", {
              method: "POST",
              body: JSON.stringify({
                name: request.design_name,
                status: "draft",
                initial_version: versionPayload
              })
            })
          );
          result = { design_id: response.id, design_version_id: response.current_version_id };
        } else {
          const response = BackendVersionReferenceSchema.parse(
            await backendJson(`/designs/${request.backend_design_id}/versions`, {
              method: "POST",
              body: JSON.stringify(versionPayload)
            })
          );
          result = { design_id: response.design_id, design_version_id: response.id };
        }
        return successResponse(SyncDesignVersionResultSchema.parse(result));
      } catch (error) {
        return backendError(error);
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.rendersCreate, async (_event, payload: unknown) => {
    const parsed = CreateRendersRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse("schema_violation", "Invalid render creation request.");
    }
    try {
      const result = CreateRendersResultSchema.parse(
        await backendJson("/renders", { method: "POST", body: JSON.stringify(parsed.data) })
      );
      return successResponse(result);
    } catch (error) {
      return backendError(error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.rendersGet, async (_event, payload: unknown): Promise<DesktopResponse<RenderJob>> => {
    const parsed = RenderJobRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse("schema_violation", "Invalid render lookup request.");
    }
    try {
      return successResponse(
        RenderJobSchema.parse(await backendJson(`/renders/${parsed.data.render_job_id}`))
      );
    } catch (error) {
      return backendError(error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.rendersList, async (_event, payload: unknown): Promise<DesktopResponse<RenderJob[]>> => {
    const parsed = ListRendersRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse("schema_violation", "Invalid render list request.");
    }
    const query = new URLSearchParams();
    if (parsed.data.design_id) {
      query.set("design_id", parsed.data.design_id);
    }
    if (parsed.data.design_version_id) {
      query.set("design_version_id", parsed.data.design_version_id);
    }
    try {
      return successResponse(
        z.array(RenderJobSchema).parse(await backendJson(`/renders${query.size > 0 ? `?${query}` : ""}`))
      );
    } catch (error) {
      return backendError(error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.rendersCancel, async (_event, payload: unknown): Promise<DesktopResponse<RenderJob>> => {
    const parsed = RenderJobRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse("schema_violation", "Invalid render cancellation request.");
    }
    try {
      return successResponse(
        RenderJobSchema.parse(
          await backendJson(`/renders/${parsed.data.render_job_id}/cancel`, { method: "POST" })
        )
      );
    } catch (error) {
      return backendError(error);
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.renderAssetGetDataUrl,
    async (_event, payload: unknown): Promise<DesktopResponse<RenderAssetDataUrlResult>> => {
      const parsed = RenderAssetDataUrlRequestSchema.safeParse(payload);
      if (!parsed.success) {
        return errorResponse("schema_violation", "Invalid render asset request.");
      }
      try {
        const response = await fetch(`${apiBaseUrl}/render-assets/${parsed.data.asset_id}`, {
          signal: AbortSignal.timeout(20_000)
        });
        if (!response.ok || response.headers.get("content-type") !== "image/png") {
          throw new BackendRequestError("render_asset_unavailable", "The render asset is unavailable.");
        }
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length === 0 || bytes.length > MAX_RENDER_ASSET_BYTES) {
          throw new BackendRequestError("render_asset_invalid", "The render asset has an invalid size.");
        }
        return successResponse(
          RenderAssetDataUrlResultSchema.parse({
            asset_id: parsed.data.asset_id,
            data_url: `data:image/png;base64,${bytes.toString("base64")}`,
            byte_size: bytes.length
          })
        );
      } catch (error) {
        return backendError(error);
      }
    }
  );
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
      preload: join(currentDir, "../preload/index.js"),
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
