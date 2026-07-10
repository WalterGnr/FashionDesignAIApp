import { describe, expect, it } from "vitest";
import { createMinimalDressSpec, specValue } from "@fashion-design-ai/domain";
import { mapDressSpecToPreview } from "../src/renderer/src/preview/preview-mapper.js";

describe("dress preview mapper", () => {
  it("uses documented fallbacks without changing the spec", () => {
    const spec = createMinimalDressSpec();
    const before = structuredClone(spec);
    const preview = mapDressSpecToPreview(spec);

    expect(preview.silhouette).toBe("a_line");
    expect(preview.skirtLength).toBe(2.05);
    expect(preview.material.color).toBe("#8f2f3c");
    expect(preview.notices.length).toBeGreaterThan(0);
    expect(spec).toEqual(before);
  });

  it("maps a red satin evening gown to a floor-length glossy material", () => {
    const base = createMinimalDressSpec();
    const spec = createMinimalDressSpec({
      identity: { ...base.identity, dress_type: specValue("evening_gown", "confirmed", "user") },
      fabric: {
        ...base.fabric,
        primary: { ...base.fabric.primary, name: specValue("satin", "confirmed", "user") }
      },
      color: {
        ...base.color,
        primary_color: { name: specValue("red", "confirmed", "user") }
      }
    });
    const preview = mapDressSpecToPreview(spec);

    expect(preview.skirtLength).toBe(3);
    expect(preview.material.color).toBe("#9d2335");
    expect(preview.material.roughness).toBeLessThan(0.3);
  });

  it("maps mermaid, sweetheart, and bishop fields to distinct geometry parameters", () => {
    const base = createMinimalDressSpec();
    const spec = createMinimalDressSpec({
      silhouette: specValue("mermaid", "confirmed", "user"),
      skirt: { ...base.skirt, shape: specValue("mermaid_flare", "confirmed", "user") },
      neckline: { ...base.neckline, type: specValue("sweetheart", "confirmed", "user") },
      sleeves: {
        ...base.sleeves,
        type: specValue("bishop", "confirmed", "user"),
        length_category: specValue("wrist", "confirmed", "user")
      },
      length: { ...base.length, category: specValue("floor", "confirmed", "user") }
    });
    const preview = mapDressSpecToPreview(spec);

    expect(preview.silhouette).toBe("mermaid");
    expect(preview.skirtShape).toBe("mermaid");
    expect(preview.neckline).toBe("sweetheart");
    expect(preview.sleeveStyle).toBe("bishop");
    expect(preview.sleeveLength).toBe(1.72);
    expect(preview.sleeveVolume).toBeGreaterThan(1);
  });

  it("accepts six-digit hex colors and maps metallic finish", () => {
    const base = createMinimalDressSpec();
    const spec = createMinimalDressSpec({
      color: {
        ...base.color,
        primary_color: { name: specValue("#2f6f62", "confirmed", "user") },
        finish: specValue("metallic", "confirmed", "user")
      }
    });
    const preview = mapDressSpecToPreview(spec);

    expect(preview.material.color).toBe("#2f6f62");
    expect(preview.material.metalness).toBe(0.35);
  });
});
