import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../shared/ipc-channels.js";
import type {
  CreateRendersRequest,
  FashionDesktopApi,
  HealthPingRequest,
  ListRendersRequest,
  OpenExternalRequest,
  RenderAssetDataUrlRequest,
  RenderJobRequest,
  SyncDesignVersionRequest
} from "../shared/ipc-contracts.js";

const fashionDesktop: FashionDesktopApi = {
  app: {
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.appGetInfo)
  },
  health: {
    ping: (request?: HealthPingRequest) => ipcRenderer.invoke(IPC_CHANNELS.healthPing, request)
  },
  shell: {
    openExternal: (request: OpenExternalRequest) => ipcRenderer.invoke(IPC_CHANNELS.shellOpenExternal, request)
  },
  backend: {
    syncDesignVersion: (request: SyncDesignVersionRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.backendSyncDesignVersion, request)
  },
  renders: {
    create: (request: CreateRendersRequest) => ipcRenderer.invoke(IPC_CHANNELS.rendersCreate, request),
    get: (request: RenderJobRequest) => ipcRenderer.invoke(IPC_CHANNELS.rendersGet, request),
    list: (request: ListRendersRequest) => ipcRenderer.invoke(IPC_CHANNELS.rendersList, request),
    cancel: (request: RenderJobRequest) => ipcRenderer.invoke(IPC_CHANNELS.rendersCancel, request),
    getAssetDataUrl: (request: RenderAssetDataUrlRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.renderAssetGetDataUrl, request)
  }
};

contextBridge.exposeInMainWorld("fashionDesktop", fashionDesktop);
