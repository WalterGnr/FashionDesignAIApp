import type {
  DesignOperation,
  DesignVersion,
  DressSpec,
  DressType,
  FabricSheerness,
  FabricDrape,
  FabricName,
  FabricStretch,
  FabricWeight,
  Finish,
  LiningCoverage,
  Measurement,
  ModelProfile,
  Occasion,
  Season,
  Silhouette,
  NecklineDepth,
  NecklineType,
  SleeveLengthCategory,
  SleeveType,
  BodiceFit,
  Waistline,
  ClosurePlacement,
  ClosureType,
  ValueSource,
  ValueStatus
} from "./schemas.js";

type SpecValue<T> = {
  value: T | null;
  status: ValueStatus;
  source: ValueSource | null;
  note?: string;
};

export function specValue<T>(value: T | null, status: ValueStatus = "unknown", source: ValueSource | null = null): SpecValue<T> {
  return { value, status, source };
}

export function unknownValue<T>(): SpecValue<T> {
  return specValue<T>(null, "unknown", null);
}

export function unknownMeasurement(): Measurement {
  return {
    value: null,
    unit: null,
    status: "unknown",
    source: null
  };
}

export function createMinimalDressSpec(overrides: Partial<DressSpec> = {}): DressSpec {
  const spec: DressSpec = {
    schema_version: "1.0.0",
    garment_category: "dress",
    identity: {
      dress_type: unknownValue<DressType>(),
      occasion: unknownValue<Occasion>(),
      season: unknownValue<Season>(),
      design_intent: []
    },
    silhouette: unknownValue<Silhouette>(),
    neckline: {
      type: unknownValue<NecklineType>(),
      depth: unknownValue<NecklineDepth>()
    },
    sleeves: {
      type: unknownValue<SleeveType>(),
      length_category: unknownValue<SleeveLengthCategory>()
    },
    bodice: {
      fit: unknownValue<BodiceFit>(),
      structure: [],
      waistline: unknownValue<Waistline>(),
      support: []
    },
    skirt: {
      shape: unknownValue(),
      features: []
    },
    length: {
      category: unknownValue()
    },
    fabric: {
      primary: {
        name: unknownValue<FabricName>(),
        weight: unknownValue<FabricWeight>(),
        drape: unknownValue<FabricDrape>(),
        stretch: unknownValue<FabricStretch>(),
        sheerness: unknownValue<FabricSheerness>(),
        finish: unknownValue<Finish>()
      },
      secondary: []
    },
    color: {
      primary_color: {
        name: unknownValue<string>()
      },
      secondary_colors: [],
      finish: unknownValue<Finish>()
    },
    embellishments: [],
    closures: {
      type: unknownValue<ClosureType>(),
      placement: unknownValue<ClosurePlacement>()
    },
    lining: {
      coverage: unknownValue<LiningCoverage>()
    },
    measurements: {
      bust: unknownMeasurement(),
      waist: unknownMeasurement(),
      hip: unknownMeasurement(),
      shoulder_width: unknownMeasurement(),
      back_length: unknownMeasurement(),
      front_length: unknownMeasurement(),
      sleeve_length: unknownMeasurement(),
      bicep: unknownMeasurement(),
      wrist: unknownMeasurement(),
      dress_length: unknownMeasurement(),
      hem_circumference: unknownMeasurement(),
      train_length: unknownMeasurement()
    },
    construction_notes: [],
    pattern_notes: [],
    assumptions: [],
    warnings: []
  };

  return {
    ...spec,
    ...overrides
  };
}

export function createMinimalModelProfile(overrides: Partial<ModelProfile> = {}): ModelProfile {
  const now = "2026-07-08T00:00:00.000Z";
  const profile: ModelProfile = {
    schema_version: "1.0.0",
    model_profile_id: "model-profile-1",
    display_name: "Sample fit model",
    measurement_unit_preference: "in",
    measurements: {
      height: { value: 68, unit: "in", status: "confirmed", source: "user" },
      bust: { value: 34, unit: "in", status: "confirmed", source: "user" },
      waist: { value: 26, unit: "in", status: "confirmed", source: "user" },
      hips: { value: 38, unit: "in", status: "confirmed", source: "user" },
      shoulder_width: unknownMeasurement(),
      inseam: unknownMeasurement()
    },
    proportions: {
      body_shape: "unknown"
    },
    fit_notes: [],
    privacy: {
      contains_sensitive_measurements: true,
      logging_allowed: false,
      export_allowed: false
    },
    created_at: now,
    updated_at: now
  };

  return {
    ...profile,
    ...overrides
  };
}

export function createInitialDesignVersion(spec: DressSpec = createMinimalDressSpec()): DesignVersion {
  return {
    version_id: "version-1",
    design_id: "design-1",
    version_number: 1,
    parent_version_id: null,
    spec_snapshot: spec,
    locked_fields: [],
    operation_ids: [],
    change_summary: "Initial design version.",
    created_by: "user",
    created_from: "ui",
    created_at: "2026-07-08T00:00:00.000Z"
  };
}

export function createOperation<T extends DesignOperation>(operation: T): T {
  return operation;
}
