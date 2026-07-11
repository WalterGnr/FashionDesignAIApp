export const IPC_CHANNELS = {
  appGetInfo: "app:get-info",
  healthPing: "health:ping",
  shellOpenExternal: "shell:open-external",
  backendSyncDesignVersion: "backend:sync-design-version",
  rendersCreate: "renders:create",
  rendersGet: "renders:get",
  rendersList: "renders:list",
  rendersCancel: "renders:cancel",
  renderAssetGetDataUrl: "render-asset:get-data-url",
  techPacksReadiness: "tech-packs:readiness",
  techPacksCreate: "tech-packs:create",
  techPacksGet: "tech-packs:get",
  techPacksList: "tech-packs:list",
  techPacksCancel: "tech-packs:cancel",
  techPackAssetOpen: "tech-pack-asset:open"
} as const;
