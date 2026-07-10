import type {
  DressSpec,
  FabricName,
  Finish,
  LengthCategory,
  NecklineType,
  Silhouette,
  SkirtShape,
  SleeveLengthCategory,
  SleeveType,
  Waistline
} from "@fashion-design-ai/domain";
import type {
  PreviewMaterial,
  PreviewNeckline,
  PreviewParameters,
  PreviewSilhouette,
  PreviewSkirtShape,
  PreviewSleeveStyle
} from "./preview-parameters.js";

const DEFAULT_COLOR = "#8f2f3c";

const COLOR_MAP: Record<string, string> = {
  red: "#9d2335",
  burgundy: "#6f1f32",
  black: "#242426",
  white: "#f5f1e9",
  ivory: "#eee2c8",
  blue: "#355c8a",
  navy: "#23344f",
  green: "#397363",
  emerald: "#17654f",
  pink: "#d57a90",
  purple: "#715089",
  gold: "#bd8a3d",
  silver: "#8a9098"
};

function label(value: string | null | undefined, fallback = "unknown"): string {
  return (value ?? fallback).replaceAll("_", " ");
}

function mapColor(value: string | null, notices: string[]): { color: string; label: string } {
  if (!value || value === "unknown") {
    notices.push("Primary color is unknown; preview uses a muted wine fallback.");
    return { color: DEFAULT_COLOR, label: "assumed wine" };
  }

  const normalized = value.trim().toLowerCase();
  const mapped = COLOR_MAP[normalized];
  if (mapped) {
    return { color: mapped, label: normalized };
  }

  if (/^#[0-9a-f]{6}$/i.test(normalized)) {
    return { color: normalized, label: normalized };
  }

  notices.push(`Color \"${value}\" is not in the preview palette; using a muted wine fallback.`);
  return { color: DEFAULT_COLOR, label: value };
}

function mapMaterial(fabric: FabricName | null, finish: Finish | null, color: string): PreviewMaterial {
  const presets: Partial<Record<FabricName, Omit<PreviewMaterial, "color">>> = {
    satin: { roughness: 0.22, metalness: 0.02, clearcoat: 0.5, opacity: 1 },
    silk: { roughness: 0.34, metalness: 0.01, clearcoat: 0.3, opacity: 1 },
    velvet: { roughness: 0.92, metalness: 0, clearcoat: 0, opacity: 1 },
    chiffon: { roughness: 0.52, metalness: 0, clearcoat: 0.08, opacity: 0.84 },
    organza: { roughness: 0.4, metalness: 0, clearcoat: 0.18, opacity: 0.88 },
    tulle: { roughness: 0.68, metalness: 0, clearcoat: 0, opacity: 0.76 },
    crepe: { roughness: 0.75, metalness: 0, clearcoat: 0.05, opacity: 1 },
    jersey: { roughness: 0.7, metalness: 0, clearcoat: 0, opacity: 1 },
    lace: { roughness: 0.72, metalness: 0, clearcoat: 0.04, opacity: 0.9 },
    brocade: { roughness: 0.5, metalness: 0.08, clearcoat: 0.12, opacity: 1 },
    mikado: { roughness: 0.38, metalness: 0.02, clearcoat: 0.2, opacity: 1 }
  };
  const base = presets[fabric ?? "unknown"] ?? { roughness: 0.64, metalness: 0, clearcoat: 0.08, opacity: 1 };

  if (finish === "metallic") {
    return { ...base, color, metalness: 0.35, roughness: Math.min(base.roughness, 0.36) };
  }
  if (finish === "glossy" || finish === "iridescent") {
    return { ...base, color, clearcoat: Math.max(base.clearcoat, 0.5), roughness: Math.min(base.roughness, 0.3) };
  }
  if (finish === "matte") {
    return { ...base, color, clearcoat: 0, roughness: Math.max(base.roughness, 0.72) };
  }

  return { ...base, color };
}

function mapSilhouette(value: Silhouette | null, notices: string[]): PreviewSilhouette {
  switch (value) {
    case "sheath":
    case "column":
    case "slip":
      return "column";
    case "fit_and_flare":
      return "fit_and_flare";
    case "ball_gown":
      return "ball_gown";
    case "empire_waist":
      return "empire";
    case "mermaid":
    case "trumpet":
      return "mermaid";
    case "shift":
    case "tent":
      return "shift";
    case "wrap":
    case "a_line":
      return "a_line";
    default:
      notices.push("Silhouette is unknown; preview uses an A-line fallback.");
      return "a_line";
  }
}

function mapSkirtShape(value: SkirtShape | null, silhouette: PreviewSilhouette): PreviewSkirtShape {
  switch (value) {
    case "straight":
      return "column";
    case "full":
    case "gathered":
    case "pleated":
    case "circle":
    case "tiered":
      return "full";
    case "bias_cut":
    case "wrap":
      return "bias";
    case "mermaid_flare":
      return "mermaid";
    case "a_line":
      return "a_line";
    default:
      if (silhouette === "ball_gown") return "full";
      if (silhouette === "column" || silhouette === "shift") return "column";
      if (silhouette === "mermaid") return "mermaid";
      return "a_line";
  }
}

function mapLength(value: LengthCategory | null, dressType: string | null, notices: string[]): number {
  const values: Partial<Record<LengthCategory, number>> = {
    mini: 1.15,
    above_knee: 1.4,
    knee: 1.62,
    midi: 2.05,
    tea: 2.28,
    ankle: 2.72,
    floor: 3,
    high_low: 2.45,
    train: 3.08
  };
  if (value && values[value]) {
    return values[value] ?? 2.45;
  }

  if (dressType === "evening_gown" || dressType === "ball_gown") {
    notices.push("Length is unknown; preview assumes floor length from the dress type.");
    return 3;
  }

  notices.push("Length is unknown; preview uses a midi fallback.");
  return 2.05;
}

function mapWaist(value: Waistline | null, silhouette: PreviewSilhouette): number {
  if (value === "empire" || silhouette === "empire") return 1.72;
  if (value === "drop") return 1.02;
  if (value === "none" || silhouette === "shift") return 1.18;
  return 1.3;
}

function mapNeckline(value: NecklineType | null): PreviewNeckline {
  const mapping: Partial<Record<NecklineType, PreviewNeckline>> = {
    crew: "round",
    scoop: "scoop",
    v_neck: "v_neck",
    sweetheart: "sweetheart",
    square: "square",
    boat: "boat",
    halter: "halter",
    off_shoulder: "off_shoulder",
    one_shoulder: "one_shoulder",
    strapless: "strapless",
    cowl: "cowl",
    high_neck: "high_neck"
  };
  return mapping[value ?? "unknown"] ?? "round";
}

function mapSleeveStyle(value: SleeveType | null): PreviewSleeveStyle {
  if (!value || value === "unknown" || value === "sleeveless") return "none";
  switch (value) {
    case "puff":
    case "bishop":
    case "bell":
    case "flutter":
    case "off_shoulder":
    case "one_sleeve":
      return value;
    default:
      return "fitted";
  }
}

function mapSleeveLength(value: SleeveLengthCategory | null, type: SleeveType | null): number {
  const values: Partial<Record<SleeveLengthCategory, number>> = {
    none: 0,
    cap: 0.28,
    short: 0.55,
    elbow: 0.92,
    three_quarter: 1.3,
    wrist: 1.72,
    dramatic_extension: 1.9
  };
  if (value && value !== "unknown") return values[value] ?? 0;
  if (type === "long" || type === "bishop" || type === "bell") return 1.72;
  if (type === "three_quarter") return 1.3;
  if (type === "elbow") return 0.92;
  if (type === "short" || type === "puff" || type === "flutter" || type === "off_shoulder") return 0.55;
  if (type === "cap") return 0.28;
  return 0;
}

export function mapDressSpecToPreview(spec: DressSpec): PreviewParameters {
  const notices: string[] = [];
  const primaryColor = mapColor(spec.color.primary_color.name.value, notices);
  const silhouette = mapSilhouette(spec.silhouette.value, notices);
  const skirtShape = mapSkirtShape(spec.skirt.shape.value, silhouette);
  const fabric = spec.fabric.primary.name.value;
  const finish = spec.fabric.primary.finish.value ?? spec.color.finish.value;
  const sleeveType = spec.sleeves.type.value;

  return {
    silhouette,
    skirtShape,
    skirtLength: mapLength(spec.length.category.value, spec.identity.dress_type.value, notices),
    waistHeight: mapWaist(spec.bodice.waistline.value, silhouette),
    neckline: mapNeckline(spec.neckline.type.value),
    sleeveStyle: mapSleeveStyle(sleeveType),
    sleeveLength: mapSleeveLength(spec.sleeves.length_category.value, sleeveType),
    sleeveVolume: ["puff", "bishop", "bell", "flutter"].includes(sleeveType ?? "") ? 1.45 : 1,
    material: mapMaterial(fabric, finish, primaryColor.color),
    labels: {
      color: primaryColor.label,
      fabric: label(fabric),
      neckline: label(spec.neckline.type.value),
      silhouette: label(spec.silhouette.value, "assumed a line"),
      skirt: spec.skirt.shape.value ? `${label(spec.skirt.shape.value)} skirt` : `assumed ${label(skirtShape)} skirt`
    },
    notices
  };
}
