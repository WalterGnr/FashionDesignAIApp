import { describe, expect, it } from "vitest";
import {
  AppInfoSchema,
  CreateRendersRequestSchema,
  HealthPingRequestSchema,
  OpenExternalRequestSchema,
  RenderJobSchema,
  SyncDesignVersionRequestSchema,
  errorResponse,
  isAllowedExternalUrl,
  successResponse
} from "../src/shared/ipc-contracts.js";

describe("desktop IPC contracts", () => {
  it("validates app info payloads", () => {
    const parsed = AppInfoSchema.safeParse({
      app_name: "Fashion Design AI",
      app_version: "0.1.0",
      platform: "win32",
      environment: "development"
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects unexpected app info fields", () => {
    const parsed = AppInfoSchema.safeParse({
      app_name: "Fashion Design AI",
      app_version: "0.1.0",
      platform: "win32",
      environment: "development",
      secret: "nope"
    });

    expect(parsed.success).toBe(false);
  });

  it("allows optional health ping requests", () => {
    expect(HealthPingRequestSchema.safeParse(undefined).success).toBe(true);
    expect(HealthPingRequestSchema.safeParse({ request_id: "startup" }).success).toBe(true);
  });

  it("validates external URL requests but only allows HTTPS", () => {
    expect(OpenExternalRequestSchema.safeParse({ url: "https://github.com/WalterGnr/FashionDesignAIApp" }).success).toBe(true);
    expect(isAllowedExternalUrl("https://github.com/WalterGnr/FashionDesignAIApp")).toBe(true);
    expect(isAllowedExternalUrl("http://example.com")).toBe(false);
    expect(isAllowedExternalUrl("file:///C:/Windows/System32/calc.exe")).toBe(false);
  });

  it("builds consistent success and error responses", () => {
    expect(successResponse({ opened: true })).toEqual({ ok: true, data: { opened: true } });
    expect(errorResponse("invalid_external_url", "Only HTTPS URLs can be opened externally.")).toEqual({
      ok: false,
      code: "invalid_external_url",
      message: "Only HTTPS URLs can be opened externally."
    });
  });

  it("validates render sync and creation requests at the desktop boundary", () => {
    const sync = SyncDesignVersionRequestSchema.safeParse({
      design_name: "Evening Dress",
      local_version_id: "version-2",
      source: "voice",
      change_summary: "Changed the dress to red satin.",
      spec_snapshot: { schema_version: "1.0.0", garment_category: "dress", color: {} },
      locked_fields_snapshot: [],
      operation_ids: ["operation-1"]
    });
    const render = CreateRendersRequestSchema.safeParse({
      design_id: "2cf99895-c76a-41ad-85cb-3954c8e600a7",
      design_version_id: "02962452-9f80-41a2-9d39-a832f36ee71d",
      render_style: "editorial_studio",
      view_preset: "three_quarter",
      quality: "medium",
      output_size: "1024x1536",
      variation_count: 2,
      client_idempotency_key: "version-2-editorial"
    });

    expect(sync.success).toBe(true);
    expect(render.success).toBe(true);
    expect(CreateRendersRequestSchema.safeParse({ ...render.data, variation_count: 5 }).success).toBe(false);
  });

  it("validates traceable completed render jobs", () => {
    const parsed = RenderJobSchema.safeParse({
      id: "43b041e2-7ae3-4e17-9701-6798b5a946f0",
      design_id: "2cf99895-c76a-41ad-85cb-3954c8e600a7",
      design_version_id: "02962452-9f80-41a2-9d39-a832f36ee71d",
      render_style: "editorial_studio",
      view_preset: "three_quarter",
      quality: "medium",
      output_size: "1024x1536",
      status: "succeeded",
      provider: "mock",
      provider_model: "local-fashion-concept-v1",
      variation_index: 1,
      attempt_count: 1,
      max_attempts: 3,
      safe_error_code: null,
      safe_error_message: null,
      created_at: "2026-07-09T12:00:00Z",
      started_at: "2026-07-09T12:00:01Z",
      completed_at: "2026-07-09T12:00:02Z",
      updated_at: "2026-07-09T12:00:02Z",
      asset: {
        id: "287ea79a-b48e-4bdb-b382-ed62d769fdd0",
        render_job_id: "43b041e2-7ae3-4e17-9701-6798b5a946f0",
        content_type: "image/png",
        byte_size: 2048,
        sha256: "a".repeat(64),
        width: 1024,
        height: 1536,
        output_format: "png",
        download_path: "/render-assets/287ea79a-b48e-4bdb-b382-ed62d769fdd0",
        created_at: "2026-07-09T12:00:02Z"
      }
    });

    expect(parsed.success).toBe(true);
  });
});
