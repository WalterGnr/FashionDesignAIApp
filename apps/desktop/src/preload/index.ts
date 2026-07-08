import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, type FashionDesktopApi, type HealthPingRequest, type OpenExternalRequest } from "../shared/ipc-contracts.js";

const fashionDesktop: FashionDesktopApi = {
  app: {
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.appGetInfo)
  },
  health: {
    ping: (request?: HealthPingRequest) => ipcRenderer.invoke(IPC_CHANNELS.healthPing, request)
  },
  shell: {
    openExternal: (request: OpenExternalRequest) => ipcRenderer.invoke(IPC_CHANNELS.shellOpenExternal, request)
  }
};

contextBridge.exposeInMainWorld("fashionDesktop", fashionDesktop);
