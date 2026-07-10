import { describe, expect, it } from "vitest";
import type { RenderJob } from "../src/shared/ipc-contracts.js";
import { isActiveRenderStatus, mergeRenderJobs, renderStatusLabel } from "../src/renderer/src/render-session.js";

function job(overrides: Partial<RenderJob> = {}): RenderJob {
  return {
    id: "43b041e2-7ae3-4e17-9701-6798b5a946f0",
    design_id: "2cf99895-c76a-41ad-85cb-3954c8e600a7",
    design_version_id: "02962452-9f80-41a2-9d39-a832f36ee71d",
    render_style: "editorial_studio",
    view_preset: "three_quarter",
    quality: "medium",
    output_size: "1024x1536",
    status: "queued",
    provider: "mock",
    provider_model: "local-fashion-concept-v1",
    variation_index: 1,
    attempt_count: 0,
    max_attempts: 3,
    safe_error_code: null,
    safe_error_message: null,
    created_at: "2026-07-09T12:00:00Z",
    started_at: null,
    completed_at: null,
    updated_at: "2026-07-09T12:00:00Z",
    asset: null,
    ...overrides
  };
}

describe("concept render session", () => {
  it("recognizes polling states and exposes concise labels", () => {
    expect(isActiveRenderStatus("queued")).toBe(true);
    expect(isActiveRenderStatus("retrying")).toBe(true);
    expect(isActiveRenderStatus("succeeded")).toBe(false);
    expect(renderStatusLabel("cancel_requested")).toBe("Canceling");
  });

  it("merges polled job updates without duplicating stable slots", () => {
    const queued = job();
    const completed = job({ status: "succeeded", attempt_count: 1, completed_at: "2026-07-09T12:00:02Z" });
    const second = job({
      id: "59790575-0009-433d-8c22-863a56d4d0cb",
      variation_index: 2,
      created_at: "2026-07-09T12:00:01Z"
    });

    const merged = mergeRenderJobs([queued], [completed, second]);

    expect(merged).toHaveLength(2);
    expect(merged[0]?.status).toBe("succeeded");
    expect(merged[1]?.variation_index).toBe(2);
  });
});
