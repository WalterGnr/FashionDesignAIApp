import { z } from "zod";

export const IPC_CHANNELS = {
  appGetInfo: "app:get-info",
  healthPing: "health:ping",
  shellOpenExternal: "shell:open-external"
} as const;

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
};
