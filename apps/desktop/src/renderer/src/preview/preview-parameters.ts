export type PreviewSilhouette =
  | "a_line"
  | "column"
  | "fit_and_flare"
  | "ball_gown"
  | "empire"
  | "mermaid"
  | "shift";

export type PreviewSkirtShape = "a_line" | "column" | "full" | "mermaid" | "bias";

export type PreviewNeckline =
  | "round"
  | "scoop"
  | "v_neck"
  | "sweetheart"
  | "square"
  | "boat"
  | "halter"
  | "off_shoulder"
  | "one_shoulder"
  | "strapless"
  | "cowl"
  | "high_neck";

export type PreviewSleeveStyle = "none" | "fitted" | "puff" | "bishop" | "bell" | "flutter" | "off_shoulder" | "one_sleeve";

export type PreviewMaterial = {
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  opacity: number;
};

export type PreviewParameters = {
  silhouette: PreviewSilhouette;
  skirtShape: PreviewSkirtShape;
  skirtLength: number;
  waistHeight: number;
  neckline: PreviewNeckline;
  sleeveStyle: PreviewSleeveStyle;
  sleeveLength: number;
  sleeveVolume: number;
  material: PreviewMaterial;
  labels: {
    color: string;
    fabric: string;
    neckline: string;
    silhouette: string;
    skirt: string;
  };
  notices: string[];
};
