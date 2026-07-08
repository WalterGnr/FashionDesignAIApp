import { describe, expect, it } from "vitest";
import {
  AppInfoSchema,
  HealthPingRequestSchema,
  OpenExternalRequestSchema,
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
});
