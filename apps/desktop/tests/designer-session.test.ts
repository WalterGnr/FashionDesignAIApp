import { describe, expect, it } from "vitest";
import { createInitialDesignVersion } from "@fashion-design-ai/domain";
import { applyDesignerTextCommand, fieldRowsFromSpec } from "../src/renderer/src/designer-session.js";

function deterministicIdFactory() {
  let index = 0;
  return (prefix: string) => {
    index += 1;
    return `${prefix}-${index}`;
  };
}

describe("designer session workflow", () => {
  it("applies a typed dress command and appends accepted versions", () => {
    const initial = createInitialDesignVersion();
    const result = applyDesignerTextCommand({
      rawInput: "Make it a red satin evening gown with off shoulder sleeves.",
      currentVersion: initial,
      versionHistory: [initial],
      now: "2026-07-08T12:00:00.000Z",
      createId: deterministicIdFactory()
    });

    expect(result.status).toBe("accepted");
    expect(result.currentVersion.spec_snapshot.color.primary_color.name.value).toBe("red");
    expect(result.currentVersion.spec_snapshot.fabric.primary.name.value).toBe("satin");
    expect(result.versionHistory.length).toBeGreaterThan(1);
  });

  it("keeps unsupported categories rejected without changing the current version", () => {
    const initial = createInitialDesignVersion();
    const result = applyDesignerTextCommand({
      rawInput: "Make a jacket with pearl buttons.",
      currentVersion: initial,
      versionHistory: [initial],
      createId: deterministicIdFactory()
    });

    expect(result.status).toBe("rejected");
    expect(result.currentVersion).toBe(initial);
    expect(result.versionHistory).toEqual([initial]);
  });

  it("marks locked field rows from the selected version", () => {
    const initial = createInitialDesignVersion();
    const result = applyDesignerTextCommand({
      rawInput: "Keep the neckline and make the skirt fuller.",
      currentVersion: initial,
      versionHistory: [initial],
      createId: deterministicIdFactory()
    });

    expect(result.status).toBe("accepted");

    const rows = fieldRowsFromSpec(result.currentVersion.spec_snapshot, result.currentVersion.locked_fields);
    expect(rows.find((row) => row.path === "neckline.type")?.status).toBe("locked");
    expect(rows.find((row) => row.path === "skirt.shape")?.value).toBe("full");
  });
});
