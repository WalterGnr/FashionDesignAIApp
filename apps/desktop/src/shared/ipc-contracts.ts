import { z } from "zod";

export { IPC_CHANNELS } from "./ipc-channels.js";

export const AppInfoSchema = z
  .object({
    app_name: z.string(),
    app_version: z.string(),
    platform: z.string(),
    environment: z.enum(["development", "production", "test"])
  })
  .strict();
export type AppInfo = z.infer<typeof AppInfoSchema>;

export const HealthPingRequestSchema = z
  .object({
    request_id: z.string().optional()
  })
  .strict()
  .optional();
export type HealthPingRequest = z.infer<typeof HealthPingRequestSchema>;

export const HealthPingResultSchema = z
  .object({
    status: z.literal("ok"),
    timestamp: z.string(),
    request_id: z.string().optional()
  })
  .strict();
export type HealthPingResult = z.infer<typeof HealthPingResultSchema>;

export const OpenExternalRequestSchema = z
  .object({
    url: z.string().url()
  })
  .strict();
export type OpenExternalRequest = z.infer<typeof OpenExternalRequestSchema>;

export const OpenExternalResultSchema = z
  .object({
    opened: z.boolean()
  })
  .strict();
export type OpenExternalResult = z.infer<typeof OpenExternalResultSchema>;

const UuidSchema = z.string().uuid();
const JsonObjectSchema = z.record(z.string(), z.unknown());

export const SyncDesignVersionRequestSchema = z
  .object({
    backend_design_id: UuidSchema.optional(),
    design_name: z.string().min(1).max(160),
    local_version_id: z.string().min(1).max(200),
    parent_backend_version_id: UuidSchema.optional(),
    source: z.enum(["text", "voice", "ui", "system", "import"]),
    change_summary: z.string().min(1).max(500),
    spec_snapshot: z
      .object({
        schema_version: z.string().min(1),
        garment_category: z.literal("dress")
      })
      .passthrough(),
    locked_fields_snapshot: z.array(JsonObjectSchema),
    operation_ids: z.array(z.string())
  })
  .strict();
export type SyncDesignVersionRequest = z.infer<typeof SyncDesignVersionRequestSchema>;

export const SyncDesignVersionResultSchema = z
  .object({
    design_id: UuidSchema,
    design_version_id: UuidSchema
  })
  .strict();
export type SyncDesignVersionResult = z.infer<typeof SyncDesignVersionResultSchema>;

export const RenderStatusSchema = z.enum([
  "queued",
  "running",
  "retrying",
  "cancel_requested",
  "canceled",
  "succeeded",
  "failed"
]);
export type RenderStatus = z.infer<typeof RenderStatusSchema>;

export const RenderAssetSchema = z
  .object({
    id: UuidSchema,
    render_job_id: UuidSchema,
    content_type: z.literal("image/png"),
    byte_size: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    output_format: z.literal("png"),
    download_path: z.string().startsWith("/render-assets/"),
    created_at: z.string()
  })
  .strict();
export type RenderAsset = z.infer<typeof RenderAssetSchema>;

export const RenderJobSchema = z
  .object({
    id: UuidSchema,
    design_id: UuidSchema,
    design_version_id: UuidSchema,
    render_style: z.string(),
    view_preset: z.string(),
    quality: z.string(),
    output_size: z.string(),
    status: RenderStatusSchema,
    provider: z.string(),
    provider_model: z.string(),
    variation_index: z.number().int().positive(),
    attempt_count: z.number().int().nonnegative(),
    max_attempts: z.number().int().positive(),
    safe_error_code: z.string().nullable(),
    safe_error_message: z.string().nullable(),
    created_at: z.string(),
    started_at: z.string().nullable(),
    completed_at: z.string().nullable(),
    updated_at: z.string(),
    asset: RenderAssetSchema.nullable()
  })
  .strict();
export type RenderJob = z.infer<typeof RenderJobSchema>;

export const CreateRendersRequestSchema = z
  .object({
    design_id: UuidSchema,
    design_version_id: UuidSchema,
    render_style: z.enum(["editorial_studio", "technical_studio"]),
    view_preset: z.enum(["front", "three_quarter", "side", "back"]),
    quality: z.enum(["low", "medium", "high"]),
    output_size: z.enum(["1024x1024", "1024x1536", "1536x1024"]),
    variation_count: z.number().int().min(1).max(4),
    client_idempotency_key: z.string().min(8).max(120)
  })
  .strict();
export type CreateRendersRequest = z.infer<typeof CreateRendersRequestSchema>;

export const CreateRendersResultSchema = z
  .object({
    jobs: z.array(RenderJobSchema).min(1).max(4),
    reused_existing: z.boolean()
  })
  .strict();
export type CreateRendersResult = z.infer<typeof CreateRendersResultSchema>;

export const RenderJobRequestSchema = z.object({ render_job_id: UuidSchema }).strict();
export type RenderJobRequest = z.infer<typeof RenderJobRequestSchema>;

export const ListRendersRequestSchema = z
  .object({
    design_id: UuidSchema.optional(),
    design_version_id: UuidSchema.optional()
  })
  .strict();
export type ListRendersRequest = z.infer<typeof ListRendersRequestSchema>;

export const RenderAssetDataUrlRequestSchema = z.object({ asset_id: UuidSchema }).strict();
export type RenderAssetDataUrlRequest = z.infer<typeof RenderAssetDataUrlRequestSchema>;

export const RenderAssetDataUrlResultSchema = z
  .object({
    asset_id: UuidSchema,
    data_url: z.string().startsWith("data:image/png;base64,"),
    byte_size: z.number().int().positive()
  })
  .strict();
export type RenderAssetDataUrlResult = z.infer<typeof RenderAssetDataUrlResultSchema>;

export const DesktopSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z
    .object({
      ok: z.literal(true),
      data: dataSchema
    })
    .strict();

export const DesktopErrorResponseSchema = z
  .object({
    ok: z.literal(false),
    code: z.string(),
    message: z.string()
  })
  .strict();
export type DesktopErrorResponse = z.infer<typeof DesktopErrorResponseSchema>;

export type DesktopSuccessResponse<T> = {
  ok: true;
  data: T;
};

export type DesktopResponse<T> = DesktopSuccessResponse<T> | DesktopErrorResponse;

export function successResponse<T>(data: T): DesktopSuccessResponse<T> {
  return {
    ok: true,
    data
  };
}

export function errorResponse(code: string, message: string): DesktopErrorResponse {
  return {
    ok: false,
    code,
    message
  };
}

export function isAllowedExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export type FashionDesktopApi = {
  app: {
    getInfo(): Promise<DesktopResponse<AppInfo>>;
  };
  health: {
    ping(request?: HealthPingRequest): Promise<DesktopResponse<HealthPingResult>>;
  };
  shell: {
    openExternal(request: OpenExternalRequest): Promise<DesktopResponse<OpenExternalResult>>;
  };
  backend: {
    syncDesignVersion(request: SyncDesignVersionRequest): Promise<DesktopResponse<SyncDesignVersionResult>>;
  };
  renders: {
    create(request: CreateRendersRequest): Promise<DesktopResponse<CreateRendersResult>>;
    get(request: RenderJobRequest): Promise<DesktopResponse<RenderJob>>;
    list(request: ListRendersRequest): Promise<DesktopResponse<RenderJob[]>>;
    cancel(request: RenderJobRequest): Promise<DesktopResponse<RenderJob>>;
    getAssetDataUrl(request: RenderAssetDataUrlRequest): Promise<DesktopResponse<RenderAssetDataUrlResult>>;
  };
};
