export const IPC_CHANNELS = {
  appGetInfo: "app:get-info",
  healthPing: "health:ping",
  shellOpenExternal: "shell:open-external",
  backendSyncDesignVersion: "backend:sync-design-version",
  rendersCreate: "renders:create",
  rendersGet: "renders:get",
  rendersList: "renders:list",
  rendersCancel: "renders:cancel",
  renderAssetGetDataUrl: "render-asset:get-data-url"
} as const;
