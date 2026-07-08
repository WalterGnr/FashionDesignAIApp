import { describe, expect, it } from "vitest";
import { createInitialDesignVersion } from "@fashion-design-ai/domain";
import {
  AICommandInterpretationResultSchema,
  createAmbiguousTrimVersion,
  createConfirmedRedDressVersion,
  createLockedNecklineVersion,
  executeAICommandResult,
  interpretAndApplyDesignerCommand,
  interpretDesignerCommand
} from "../src/index.js";

function idFactory(): (prefix: string) => string {
  let nextId = 0;
  return (prefix: string) => `${prefix}-${++nextId}`;
}

function commonInput(rawInput: string) {
  return {
    rawInput,
    currentVersion: createInitialDesignVersion(),
    now: "2026-07-08T12:00:00.000Z",
    createId: idFactory()
  };
}

describe("AI command interpretation schemas", () => {
  it("accepts a structured operation batch result", () => {
    const result = interpretDesignerCommand(commonInput("Make it a red satin evening gown with an off-shoulder neckline."));

    expect(AICommandInterpretationResultSchema.safeParse(result).success).toBe(true);
    expect(result.result_type).toBe("operation_batch");
    if (result.result_type === "operation_batch") {
      expect(result.operation_batch.operations).toHaveLength(5);
    }
  });

  it("rejects malformed AI output before domain state can change", () => {
    const outcome = executeAICommandResult({
      result: {
        result_type: "operation_batch",
        confidence: 0.9
      },
      currentVersion: createInitialDesignVersion()
    });

    expect(outcome.status).toBe("rejected");
    if (outcome.status === "rejected") {
      expect(outcome.reason_code).toBe("schema_violation");
    }
  });
});

describe("Sprint 02 evaluation examples", () => {
  it("creates a red satin evening gown operation batch and applies it through the domain engine", () => {
    const result = interpretAndApplyDesignerCommand(commonInput("Make it a red satin evening gown with an off-shoulder neckline."));

    expect(result.proposed_result.result_type).toBe("operation_batch");
    expect(result.execution.status).toBe("accepted");
    if (result.execution.status === "accepted") {
      expect(result.execution.final_version.spec_snapshot.identity.dress_type.value).toBe("evening_gown");
      expect(result.execution.final_version.spec_snapshot.fabric.primary.name.value).toBe("satin");
      expect(result.execution.final_version.spec_snapshot.color.primary_color.name.value).toBe("red");
      expect(result.execution.final_version.spec_snapshot.neckline.type.value).toBe("off_shoulder");
      expect(result.execution.final_version.spec_snapshot.closures.type.value).toBeNull();
      expect(result.execution.operation_results).toHaveLength(5);
    }
  });

  it("asks for measurement units when shortening by a bare number", () => {
    const result = interpretAndApplyDesignerCommand(commonInput("Shorten the dress by 2."));

    expect(result.proposed_result.result_type).toBe("clarification_request");
    expect(result.execution.status).toBe("needs_clarification");
    if (result.execution.status === "needs_clarification") {
      expect(result.execution.field_path).toBe("measurements.dress_length");
      expect(result.execution.options).toEqual(["in", "cm"]);
    }
  });

  it("rejects a neckline change when the neckline is locked", () => {
    const result = interpretAndApplyDesignerCommand({
      rawInput: "Change the neckline to sweetheart.",
      currentVersion: createLockedNecklineVersion(),
      now: "2026-07-08T12:00:00.000Z",
      createId: idFactory()
    });

    expect(result.proposed_result.result_type).toBe("rejection");
    expect(result.execution.status).toBe("rejected");
    if (result.execution.status === "rejected") {
      expect(result.execution.reason_code).toBe("locked_field");
      expect(result.execution.field_path).toBe("neckline");
    }
  });

  it("clarifies subjective direction instead of inventing unrelated fields", () => {
    const result = interpretAndApplyDesignerCommand(commonInput("Make it more dramatic."));

    expect(result.proposed_result.result_type).toBe("clarification_request");
    expect(result.execution.status).toBe("needs_clarification");
    if (result.execution.status === "needs_clarification") {
      expect(result.execution.options).toEqual(["silhouette", "length", "color", "fabric", "embellishments"]);
    }
  });

  it("adds pearl trim around the neckline as an embellishment detail", () => {
    const result = interpretAndApplyDesignerCommand(commonInput("Add pearl trim around the neckline."));

    expect(result.execution.status).toBe("accepted");
    if (result.execution.status === "accepted") {
      expect(result.execution.final_version.spec_snapshot.embellishments).toHaveLength(1);
      expect(result.execution.final_version.spec_snapshot.embellishments[0]?.type).toBe("pearls");
      expect(result.execution.final_version.spec_snapshot.embellishments[0]?.placement).toBe("neckline");
    }
  });

  it("rejects non-dress garment requests for the MVP", () => {
    const result = interpretAndApplyDesignerCommand(commonInput("Design matching pants for this look."));

    expect(result.proposed_result.result_type).toBe("rejection");
    expect(result.execution.status).toBe("rejected");
    if (result.execution.status === "rejected") {
      expect(result.execution.reason_code).toBe("unsupported_category");
    }
  });

  it("returns no-op when the requested color is already set", () => {
    const result = interpretAndApplyDesignerCommand({
      rawInput: "Make it red.",
      currentVersion: createConfirmedRedDressVersion(),
      now: "2026-07-08T12:00:00.000Z",
      createId: idFactory()
    });

    expect(result.proposed_result.result_type).toBe("no_op");
    expect(result.execution.status).toBe("no_op");
  });

  it("asks which trim to remove when multiple trims match", () => {
    const result = interpretAndApplyDesignerCommand({
      rawInput: "Remove the trim.",
      currentVersion: createAmbiguousTrimVersion(),
      now: "2026-07-08T12:00:00.000Z",
      createId: idFactory()
    });

    expect(result.proposed_result.result_type).toBe("clarification_request");
    expect(result.execution.status).toBe("needs_clarification");
    if (result.execution.status === "needs_clarification") {
      expect(result.execution.options).toEqual(["pearls at neckline", "lace_trim at hem"]);
    }
  });
});
