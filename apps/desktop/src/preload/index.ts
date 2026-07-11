import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../shared/ipc-channels.js";
import type {
  CreateTechPackRequest,
  CreateRendersRequest,
  FashionDesktopApi,
  HealthPingRequest,
  ListRendersRequest,
  ListTechPacksRequest,
  OpenTechPackAssetRequest,
  OpenExternalRequest,
  RenderAssetDataUrlRequest,
  RenderJobRequest,
  SyncDesignVersionRequest,
  TechPackJobRequest,
  TechPackReadinessRequest
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
  },
  techPacks: {
    readiness: (request: TechPackReadinessRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.techPacksReadiness, request),
    create: (request: CreateTechPackRequest) => ipcRenderer.invoke(IPC_CHANNELS.techPacksCreate, request),
    get: (request: TechPackJobRequest) => ipcRenderer.invoke(IPC_CHANNELS.techPacksGet, request),
    list: (request: ListTechPacksRequest) => ipcRenderer.invoke(IPC_CHANNELS.techPacksList, request),
    cancel: (request: TechPackJobRequest) => ipcRenderer.invoke(IPC_CHANNELS.techPacksCancel, request),
    openAsset: (request: OpenTechPackAssetRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.techPackAssetOpen, request)
  }
};

contextBridge.exposeInMainWorld("fashionDesktop", fashionDesktop);
