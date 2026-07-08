import type { FashionDesktopApi } from "../../shared/ipc-contracts.js";

declare global {
  interface Window {
    fashionDesktop: FashionDesktopApi;
  }
}

export {};
