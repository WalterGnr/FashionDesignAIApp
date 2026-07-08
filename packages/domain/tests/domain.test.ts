import { describe, expect, it } from "vitest";
import {
  DesignOperationSchema,
  DressSpecSchema,
  ModelProfileSchema,
  applyDesignOperation,
  createInitialDesignVersion,
  createMinimalDressSpec,
  createMinimalModelProfile,
  type DesignOperation,
  type DesignVersion
} from "../src/index.js";

function idFactory(): (prefix: string) => string {
  let nextId = 0;
  return (prefix: string) => `${prefix}-${++nextId}`;
}

function operation<T extends DesignOperation>(input: T): T {
  return input;
}

function apply(currentVersion: DesignVersion, operationToApply: DesignOperation) {
  return applyDesignOperation({
    currentVersion,
    operation: operationToApply,
    now: "2026-07-08T12:00:00.000Z",
    createId: idFactory()
  });
}

describe("Sprint 01 domain schemas", () => {
  it("accepts a minimal dress spec and rejects unsupported garment categories", () => {
    const spec = createMinimalDressSpec();

    expect(DressSpecSchema.safeParse(spec).success).toBe(true);
    expect(
      DressSpecSchema.safeParse({
        ...spec,
        garment_category: "pants"
      }).success
    ).toBe(false);
  });

  it("accepts a minimal model profile and rejects invalid body measurements", () => {
    const profile = createMinimalModelProfile();

    expect(ModelProfileSchema.safeParse(profile).success).toBe(true);
    expect(
      ModelProfileSchema.safeParse({
        ...profile,
        measurements: {
          ...profile.measurements,
          height: { value: 68, unit: null, status: "confirmed", source: "user" }
        }
      }).success
    ).toBe(false);
    expect(
      ModelProfileSchema.safeParse({
        ...profile,
        measurements: {
          ...profile.measurements,
          waist: { value: -2, unit: "in", status: "confirmed", source: "user" }
        }
      }).success
    ).toBe(false);
  });

  it("validates operation envelopes and requires AI confidence", () => {
    const parsed = DesignOperationSchema.safeParse(
      operation({
        operation_id: "operation-1",
        type: "set_field",
        actor: "user",
        source: "text",
        target: "silhouette",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "silhouette",
          value: "a_line",
          value_status: "confirmed"
        }
      })
    );

    expect(parsed.success).toBe(true);

    const current = createInitialDesignVersion();
    const result = applyDesignOperation({
      currentVersion: current,
      operation: operation({
        operation_id: "operation-2",
        type: "set_field",
        actor: "ai",
        source: "text",
        target: "silhouette",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "silhouette",
          value: "a_line",
          value_status: "assumed"
        }
      }),
      createId: idFactory()
    });

    expect(result.status).toBe("rejected");
    if (result.status === "rejected") {
      expect(result.reason_code).toBe("missing_required_payload");
    }
  });
});

describe("Sprint 01 operation application", () => {
  it("sets a confirmed field value, creates a new version, and leaves the previous version unchanged", () => {
    const current = createInitialDesignVersion();
    const result = apply(
      current,
      operation({
        operation_id: "operation-3",
        type: "set_field",
        actor: "user",
        source: "voice",
        target: "silhouette",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "silhouette",
          value: "mermaid",
          value_status: "confirmed"
        }
      })
    );

    expect(result.status).toBe("accepted");
    if (result.status === "accepted") {
      expect(result.new_version.spec_snapshot.silhouette.value).toBe("mermaid");
      expect(result.new_version.parent_version_id).toBe(current.version_id);
      expect(result.new_version.version_number).toBe(2);
    }
    expect(current.spec_snapshot.silhouette.value).toBeNull();
  });

  it("blocks changes under locked fields until the field is unlocked", () => {
    const current = createInitialDesignVersion();
    const lockResult = apply(
      current,
      operation({
        operation_id: "operation-4",
        type: "lock_field",
        actor: "user",
        source: "ui",
        target: "neckline",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "neckline",
          reason: "Designer approved this neckline."
        }
      })
    );

    expect(lockResult.status).toBe("accepted");
    if (lockResult.status !== "accepted") {
      return;
    }

    const blockedResult = apply(
      lockResult.new_version,
      operation({
        operation_id: "operation-5",
        type: "set_field",
        actor: "ai",
        source: "text",
        target: "neckline.type",
        confidence: 0.92,
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "neckline.type",
          value: "sweetheart",
          value_status: "assumed"
        }
      })
    );

    expect(blockedResult.status).toBe("rejected");
    if (blockedResult.status === "rejected") {
      expect(blockedResult.reason_code).toBe("locked_field");
      expect(blockedResult.field_path).toBe("neckline");
    }
  });

  it("asks for clarification when a numeric measurement has no unit", () => {
    const current = createInitialDesignVersion();
    const result = apply(
      current,
      operation({
        operation_id: "operation-6",
        type: "modify_measurement",
        actor: "user",
        source: "voice",
        target: "measurements.waist",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "measurements.waist",
          mode: "set",
          measurement: {
            value: 26,
            unit: null,
            status: "confirmed",
            source: "user"
          }
        }
      })
    );

    expect(result.status).toBe("needs_clarification");
    if (result.status === "needs_clarification") {
      expect(result.field_path).toBe("measurements.waist");
      expect(result.options).toEqual(["in", "cm"]);
    }
  });

  it("adds and removes embellishment details with schema validation", () => {
    const current = createInitialDesignVersion();
    const addResult = apply(
      current,
      operation({
        operation_id: "operation-7",
        type: "add_detail",
        actor: "user",
        source: "text",
        target: "embellishments",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "embellishments",
          detail: {
            id: "embellishment-1",
            type: "pearls",
            placement: "neckline",
            density: "moderate",
            status: "confirmed",
            notes: "Small pearl trim around the neckline."
          }
        }
      })
    );

    expect(addResult.status).toBe("accepted");
    if (addResult.status !== "accepted") {
      return;
    }
    expect(addResult.new_version.spec_snapshot.embellishments).toHaveLength(1);

    const removeResult = apply(
      addResult.new_version,
      operation({
        operation_id: "operation-8",
        type: "remove_detail",
        actor: "user",
        source: "ui",
        target: "embellishments",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "embellishments",
          detail_id: "embellishment-1"
        }
      })
    );

    expect(removeResult.status).toBe("accepted");
    if (removeResult.status === "accepted") {
      expect(removeResult.new_version.spec_snapshot.embellishments).toHaveLength(0);
    }
  });

  it("creates a variation branch and records the variation label", () => {
    const current = createInitialDesignVersion();
    const result = apply(
      current,
      operation({
        operation_id: "operation-9",
        type: "create_variation",
        actor: "user",
        source: "ui",
        target: "design",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          parent_version_id: current.version_id,
          variation_label: "Runway neckline option",
          operations: []
        }
      })
    );

    expect(result.status).toBe("accepted");
    if (result.status === "accepted") {
      expect(result.new_version.branch_id).toBe("branch-1");
      expect(result.new_version.variation_label).toBe("Runway neckline option");
      expect(result.new_version.parent_version_id).toBe(current.version_id);
    }
  });

  it("reverts to a prior version by creating a new version with the previous snapshot", () => {
    const first = createInitialDesignVersion();
    const secondResult = apply(
      first,
      operation({
        operation_id: "operation-10",
        type: "set_field",
        actor: "user",
        source: "text",
        target: "silhouette",
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          field_path: "silhouette",
          value: "a_line",
          value_status: "confirmed"
        }
      })
    );

    expect(secondResult.status).toBe("accepted");
    if (secondResult.status !== "accepted") {
      return;
    }

    const revertResult = applyDesignOperation({
      currentVersion: secondResult.new_version,
      versionHistory: [first, secondResult.new_version],
      operation: operation({
        operation_id: "operation-11",
        type: "revert_to_version",
        actor: "user",
        source: "ui",
        target: first.version_id,
        creates_version: true,
        created_at: "2026-07-08T12:00:00.000Z",
        payload: {
          target_version_id: first.version_id,
          reason: "Return to the original silhouette."
        }
      }),
      now: "2026-07-08T12:00:00.000Z",
      createId: idFactory()
    });

    expect(revertResult.status).toBe("accepted");
    if (revertResult.status === "accepted") {
      expect(revertResult.new_version.spec_snapshot.silhouette.value).toBeNull();
      expect(revertResult.new_version.parent_version_id).toBe(secondResult.new_version.version_id);
      expect(revertResult.new_version.version_number).toBe(3);
    }
  });
});
