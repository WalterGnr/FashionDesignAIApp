import { z } from "zod";

export const ValueStatusSchema = z.enum(["unknown", "assumed", "confirmed"]);
export type ValueStatus = z.infer<typeof ValueStatusSchema>;

export const ValueSourceSchema = z.enum(["user", "ai", "system", "import"]);
export type ValueSource = z.infer<typeof ValueSourceSchema>;

export const OperationSourceSchema = z.enum(["voice", "text", "ui", "import", "system"]);
export type OperationSource = z.infer<typeof OperationSourceSchema>;

export const ActorSchema = z.enum(["user", "ai", "system"]);
export type Actor = z.infer<typeof ActorSchema>;

export const UnitSchema = z.enum(["in", "cm"]);
export type Unit = z.infer<typeof UnitSchema>;

export const specValueSchema = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      value: valueSchema.nullable(),
      status: ValueStatusSchema,
      source: ValueSourceSchema.nullable(),
      note: z.string().optional()
    })
    .strict();

export const MeasurementSchema = z
  .object({
    value: z.number().nullable(),
    unit: UnitSchema.nullable(),
    status: ValueStatusSchema,
    source: ValueSourceSchema.nullable(),
    note: z.string().optional()
  })
  .strict()
  .superRefine((measurement, ctx) => {
    if (measurement.value !== null && measurement.unit === null) {
      ctx.addIssue({
        code: "custom",
        path: ["unit"],
        message: "Numeric measurements require a unit."
      });
    }

    if (measurement.value !== null && measurement.value < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Measurements cannot be negative."
      });
    }
  });
export type Measurement = z.infer<typeof MeasurementSchema>;

export const LooseMeasurementSchema = z
  .object({
    value: z.number().nullable(),
    unit: UnitSchema.nullable(),
    status: ValueStatusSchema,
    source: ValueSourceSchema.nullable(),
    note: z.string().optional()
  })
  .strict();
export type LooseMeasurement = z.infer<typeof LooseMeasurementSchema>;

const NullableStringSchema = z.string().nullable();

export const DressTypeSchema = z.enum([
  "evening_gown",
  "cocktail_dress",
  "casual_dress",
  "bridal_dress",
  "formal_dress",
  "runway_dress",
  "unknown"
]);
export type DressType = z.infer<typeof DressTypeSchema>;

export const OccasionSchema = z.enum([
  "evening",
  "bridal",
  "work",
  "casual",
  "gala",
  "performance",
  "editorial",
  "unknown"
]);
export type Occasion = z.infer<typeof OccasionSchema>;

export const SeasonSchema = z.enum(["spring", "summer", "fall", "winter", "seasonless", "unknown"]);
export type Season = z.infer<typeof SeasonSchema>;

export const SilhouetteSchema = z.enum([
  "a_line",
  "sheath",
  "fit_and_flare",
  "mermaid",
  "trumpet",
  "ball_gown",
  "empire_waist",
  "shift",
  "slip",
  "column",
  "wrap",
  "tent",
  "unknown"
]);
export type Silhouette = z.infer<typeof SilhouetteSchema>;

export const NecklineTypeSchema = z.enum([
  "crew",
  "scoop",
  "v_neck",
  "sweetheart",
  "square",
  "boat",
  "halter",
  "off_shoulder",
  "one_shoulder",
  "strapless",
  "cowl",
  "high_neck",
  "unknown"
]);
export type NecklineType = z.infer<typeof NecklineTypeSchema>;

export const NecklineDepthSchema = z.enum(["high", "medium", "low", "unknown"]);
export type NecklineDepth = z.infer<typeof NecklineDepthSchema>;

export const SleeveTypeSchema = z.enum([
  "sleeveless",
  "cap",
  "short",
  "elbow",
  "three_quarter",
  "long",
  "puff",
  "bishop",
  "bell",
  "flutter",
  "off_shoulder",
  "one_sleeve",
  "unknown"
]);
export type SleeveType = z.infer<typeof SleeveTypeSchema>;

export const SleeveLengthCategorySchema = z.enum([
  "none",
  "cap",
  "short",
  "elbow",
  "three_quarter",
  "wrist",
  "dramatic_extension",
  "unknown"
]);
export type SleeveLengthCategory = z.infer<typeof SleeveLengthCategorySchema>;

export const BodiceFitSchema = z.enum(["fitted", "relaxed", "unknown"]);
export type BodiceFit = z.infer<typeof BodiceFitSchema>;
export const BodiceStructureSchema = z.enum([
  "corset",
  "boned",
  "draped",
  "ruched",
  "wrap",
  "asymmetric",
  "princess_seams",
  "unknown"
]);
export type BodiceStructure = z.infer<typeof BodiceStructureSchema>;
export const WaistlineSchema = z.enum(["empire", "natural", "drop", "none", "unknown"]);
export type Waistline = z.infer<typeof WaistlineSchema>;
export const SupportSchema = z.enum(["boning", "cups", "interfacing", "none", "unknown"]);
export type Support = z.infer<typeof SupportSchema>;

export const SkirtShapeSchema = z.enum([
  "straight",
  "a_line",
  "full",
  "gathered",
  "pleated",
  "circle",
  "tiered",
  "bias_cut",
  "wrap",
  "mermaid_flare",
  "unknown"
]);
export type SkirtShape = z.infer<typeof SkirtShapeSchema>;

export const SkirtFeatureSchema = z.enum(["slit", "train", "high_low", "godets"]);
export type SkirtFeature = z.infer<typeof SkirtFeatureSchema>;

export const LengthCategorySchema = z.enum([
  "mini",
  "above_knee",
  "knee",
  "midi",
  "tea",
  "ankle",
  "floor",
  "high_low",
  "train",
  "unknown"
]);
export type LengthCategory = z.infer<typeof LengthCategorySchema>;

export const FabricNameSchema = z.enum([
  "silk",
  "satin",
  "chiffon",
  "organza",
  "tulle",
  "crepe",
  "jersey",
  "velvet",
  "lace",
  "cotton_poplin",
  "linen",
  "brocade",
  "mikado",
  "unknown"
]);
export type FabricName = z.infer<typeof FabricNameSchema>;
export const FabricWeightSchema = z.enum(["lightweight", "medium", "heavyweight", "unknown"]);
export type FabricWeight = z.infer<typeof FabricWeightSchema>;
export const FabricDrapeSchema = z.enum(["fluid", "moderate", "structured", "crisp", "unknown"]);
export type FabricDrape = z.infer<typeof FabricDrapeSchema>;
export const FabricStretchSchema = z.enum(["none", "slight", "moderate", "high", "unknown"]);
export type FabricStretch = z.infer<typeof FabricStretchSchema>;
export const FabricSheernessSchema = z.enum(["opaque", "semi_sheer", "sheer", "unknown"]);
export type FabricSheerness = z.infer<typeof FabricSheernessSchema>;
export const FinishSchema = z.enum(["matte", "glossy", "metallic", "iridescent", "textured", "unknown"]);
export type Finish = z.infer<typeof FinishSchema>;

export const EmbellishmentTypeSchema = z.enum([
  "beading",
  "sequins",
  "pearls",
  "applique",
  "embroidery",
  "lace_trim",
  "rhinestones",
  "feathers",
  "fringe",
  "ruffles",
  "bows",
  "piping",
  "other"
]);
export const EmbellishmentPlacementSchema = z.enum([
  "neckline",
  "bodice",
  "waist",
  "skirt",
  "hem",
  "sleeves",
  "all_over",
  "custom"
]);
export const DensitySchema = z.enum(["sparse", "moderate", "heavy", "unknown"]);

export const ClosureTypeSchema = z.enum([
  "invisible_zipper",
  "exposed_zipper",
  "button",
  "hook_and_eye",
  "corset_lacing",
  "snap",
  "tie",
  "pull_on",
  "unknown"
]);
export type ClosureType = z.infer<typeof ClosureTypeSchema>;
export const ClosurePlacementSchema = z.enum(["center_back", "side_seam", "shoulder", "front", "other", "unknown"]);
export type ClosurePlacement = z.infer<typeof ClosurePlacementSchema>;
export const LiningCoverageSchema = z.enum(["fully_lined", "partially_lined", "unlined", "unknown"]);
export type LiningCoverage = z.infer<typeof LiningCoverageSchema>;

export const NoteSchema = z
  .object({
    id: z.string(),
    text: z.string().min(1),
    status: ValueStatusSchema,
    source: ValueSourceSchema
  })
  .strict();
export type Note = z.infer<typeof NoteSchema>;

export const ColorDescriptorSchema = z
  .object({
    name: specValueSchema(z.string()),
    hex: z.string().nullable().optional(),
    notes: z.string().optional()
  })
  .strict();

export const FabricDescriptorSchema = z
  .object({
    name: specValueSchema(FabricNameSchema),
    fiber_content: z.string().optional(),
    weight: specValueSchema(FabricWeightSchema),
    drape: specValueSchema(FabricDrapeSchema),
    stretch: specValueSchema(FabricStretchSchema),
    sheerness: specValueSchema(FabricSheernessSchema),
    finish: specValueSchema(FinishSchema),
    notes: z.string().optional()
  })
  .strict();

export const EmbellishmentSchema = z
  .object({
    id: z.string(),
    type: EmbellishmentTypeSchema,
    placement: EmbellishmentPlacementSchema,
    density: DensitySchema,
    material: z.string().optional(),
    color: ColorDescriptorSchema.optional(),
    status: ValueStatusSchema,
    notes: z.string().optional()
  })
  .strict();
export type Embellishment = z.infer<typeof EmbellishmentSchema>;

export const AssumptionSchema = z
  .object({
    id: z.string(),
    field_path: z.string(),
    value_summary: z.string(),
    reason: z.string(),
    source: z.enum(["ai", "system"]),
    created_at: z.string()
  })
  .strict();

export const WarningSchema = z
  .object({
    id: z.string(),
    severity: z.enum(["info", "warning", "blocking"]),
    field_path: z.string(),
    message: z.string(),
    source: z.enum(["ai", "system", "user"])
  })
  .strict();

export const DressSpecSchema = z
  .object({
    schema_version: z.string(),
    garment_category: z.literal("dress"),
    identity: z
      .object({
        name: z.string().optional(),
        dress_type: specValueSchema(DressTypeSchema),
        occasion: specValueSchema(OccasionSchema),
        season: specValueSchema(SeasonSchema),
        design_intent: z.array(z.string())
      })
      .strict(),
    silhouette: specValueSchema(SilhouetteSchema),
    neckline: z
      .object({
        type: specValueSchema(NecklineTypeSchema),
        depth: specValueSchema(NecklineDepthSchema),
        notes: z.string().optional()
      })
      .strict(),
    sleeves: z
      .object({
        type: specValueSchema(SleeveTypeSchema),
        length_category: specValueSchema(SleeveLengthCategorySchema),
        measurement: MeasurementSchema.optional(),
        notes: z.string().optional()
      })
      .strict()
      .superRefine((sleeves, ctx) => {
        if (sleeves.type.value === "sleeveless" && sleeves.length_category.value !== "none") {
          ctx.addIssue({
            code: "custom",
            path: ["length_category"],
            message: "Sleeveless designs should use the none sleeve length category."
          });
        }
      }),
    bodice: z
      .object({
        fit: specValueSchema(BodiceFitSchema),
        structure: z.array(specValueSchema(BodiceStructureSchema)),
        waistline: specValueSchema(WaistlineSchema),
        support: z.array(specValueSchema(SupportSchema)),
        notes: z.string().optional()
      })
      .strict(),
    skirt: z
      .object({
        shape: specValueSchema(SkirtShapeSchema),
        features: z.array(SkirtFeatureSchema),
        notes: z.string().optional()
      })
      .strict(),
    length: z
      .object({
        category: specValueSchema(LengthCategorySchema),
        front_measurement: MeasurementSchema.optional(),
        back_measurement: MeasurementSchema.optional(),
        train_length: MeasurementSchema.optional(),
        notes: z.string().optional()
      })
      .strict(),
    fabric: z
      .object({
        primary: FabricDescriptorSchema,
        secondary: z.array(FabricDescriptorSchema),
        notes: z.string().optional()
      })
      .strict(),
    color: z
      .object({
        primary_color: ColorDescriptorSchema,
        secondary_colors: z.array(ColorDescriptorSchema),
        colorway_name: NullableStringSchema.optional(),
        pattern_or_print: NullableStringSchema.optional(),
        finish: specValueSchema(FinishSchema)
      })
      .strict(),
    embellishments: z.array(EmbellishmentSchema),
    closures: z
      .object({
        type: specValueSchema(ClosureTypeSchema),
        placement: specValueSchema(ClosurePlacementSchema),
        notes: z.string().optional()
      })
      .strict(),
    lining: z
      .object({
        coverage: specValueSchema(LiningCoverageSchema),
        fabric: FabricDescriptorSchema.optional(),
        color: ColorDescriptorSchema.optional(),
        support_notes: z.string().optional()
      })
      .strict(),
    measurements: z
      .object({
        bust: MeasurementSchema,
        waist: MeasurementSchema,
        hip: MeasurementSchema,
        shoulder_width: MeasurementSchema,
        back_length: MeasurementSchema,
        front_length: MeasurementSchema,
        sleeve_length: MeasurementSchema,
        bicep: MeasurementSchema,
        wrist: MeasurementSchema,
        dress_length: MeasurementSchema,
        hem_circumference: MeasurementSchema,
        train_length: MeasurementSchema
      })
      .strict(),
    construction_notes: z.array(NoteSchema),
    pattern_notes: z.array(NoteSchema),
    assumptions: z.array(AssumptionSchema),
    warnings: z.array(WarningSchema)
  })
  .strict();
export type DressSpec = z.infer<typeof DressSpecSchema>;

const BodyMeasurementSchema = MeasurementSchema;

export const ModelProfileSchema = z
  .object({
    schema_version: z.string(),
    model_profile_id: z.string(),
    display_name: z.string(),
    measurement_unit_preference: UnitSchema,
    measurements: z
      .object({
        height: BodyMeasurementSchema,
        bust: BodyMeasurementSchema,
        waist: BodyMeasurementSchema,
        hips: BodyMeasurementSchema,
        shoulder_width: BodyMeasurementSchema,
        inseam: BodyMeasurementSchema,
        neck_circumference: BodyMeasurementSchema.optional(),
        underbust: BodyMeasurementSchema.optional(),
        high_hip: BodyMeasurementSchema.optional(),
        torso_length: BodyMeasurementSchema.optional(),
        back_length: BodyMeasurementSchema.optional(),
        arm_length: BodyMeasurementSchema.optional(),
        bicep: BodyMeasurementSchema.optional(),
        wrist: BodyMeasurementSchema.optional(),
        thigh: BodyMeasurementSchema.optional(),
        calf: BodyMeasurementSchema.optional()
      })
      .strict(),
    proportions: z
      .object({
        body_shape: z.enum(["hourglass", "pear", "apple", "rectangle", "inverted_triangle", "custom", "unknown"]),
        posture_notes: z.string().optional(),
        fit_model_notes: z.string().optional()
      })
      .strict(),
    fit_notes: z.array(
      z
        .object({
          id: z.string(),
          text: z.string(),
          source: z.enum(["user", "system", "import"]),
          created_at: z.string()
        })
        .strict()
    ),
    privacy: z
      .object({
        contains_sensitive_measurements: z.literal(true),
        logging_allowed: z.boolean().default(false),
        export_allowed: z.boolean().default(false)
      })
      .strict(),
    created_at: z.string(),
    updated_at: z.string()
  })
  .strict();
export type ModelProfile = z.infer<typeof ModelProfileSchema>;

export const LockedFieldSchema = z
  .object({
    lock_id: z.string(),
    field_path: z.string(),
    reason: z.string(),
    locked_by: ActorSchema,
    locked_from: OperationSourceSchema,
    created_at: z.string()
  })
  .strict();
export type LockedField = z.infer<typeof LockedFieldSchema>;

export const OperationTypeSchema = z.enum([
  "set_field",
  "add_detail",
  "remove_detail",
  "modify_measurement",
  "lock_field",
  "unlock_field",
  "create_variation",
  "revert_to_version"
]);

const BaseOperationSchema = z.object({
  operation_id: z.string(),
  actor: ActorSchema,
  source: OperationSourceSchema,
  target: z.string(),
  raw_input_ref: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  creates_version: z.boolean(),
  created_at: z.string()
});

export const SetFieldOperationSchema = BaseOperationSchema.extend({
  type: z.literal("set_field"),
  payload: z
    .object({
      field_path: z.string(),
      value: z.unknown(),
      value_status: ValueStatusSchema
    })
    .strict()
}).strict();

export const AddDetailOperationSchema = BaseOperationSchema.extend({
  type: z.literal("add_detail"),
  payload: z
    .object({
      field_path: z.string(),
      detail: z.unknown()
    })
    .strict()
}).strict();

export const RemoveDetailOperationSchema = BaseOperationSchema.extend({
  type: z.literal("remove_detail"),
  payload: z
    .object({
      field_path: z.string(),
      detail_id: z.string()
    })
    .strict()
}).strict();

export const ModifyMeasurementOperationSchema = BaseOperationSchema.extend({
  type: z.literal("modify_measurement"),
  payload: z
    .object({
      field_path: z.string(),
      mode: z.enum(["set", "adjust"]),
      measurement: LooseMeasurementSchema
    })
    .strict()
}).strict();

export const LockFieldOperationSchema = BaseOperationSchema.extend({
  type: z.literal("lock_field"),
  payload: z
    .object({
      field_path: z.string(),
      reason: z.string()
    })
    .strict()
}).strict();

export const UnlockFieldOperationSchema = BaseOperationSchema.extend({
  type: z.literal("unlock_field"),
  payload: z
    .object({
      field_path: z.string(),
      reason: z.string()
    })
    .strict()
}).strict();

export const CreateVariationOperationSchema = BaseOperationSchema.extend({
  type: z.literal("create_variation"),
  payload: z
    .object({
      parent_version_id: z.string(),
      variation_label: z.string(),
      operations: z.array(z.unknown())
    })
    .strict()
}).strict();

export const RevertToVersionOperationSchema = BaseOperationSchema.extend({
  type: z.literal("revert_to_version"),
  payload: z
    .object({
      target_version_id: z.string(),
      reason: z.string()
    })
    .strict()
}).strict();

export const DesignOperationSchema = z.discriminatedUnion("type", [
  SetFieldOperationSchema,
  AddDetailOperationSchema,
  RemoveDetailOperationSchema,
  ModifyMeasurementOperationSchema,
  LockFieldOperationSchema,
  UnlockFieldOperationSchema,
  CreateVariationOperationSchema,
  RevertToVersionOperationSchema
]);
export type DesignOperation = z.infer<typeof DesignOperationSchema>;

export const DesignVersionSchema = z
  .object({
    version_id: z.string(),
    design_id: z.string(),
    version_number: z.number().int().positive(),
    parent_version_id: z.string().nullable(),
    branch_id: z.string().nullable().optional(),
    variation_label: z.string().nullable().optional(),
    spec_snapshot: DressSpecSchema,
    locked_fields: z.array(LockedFieldSchema),
    operation_ids: z.array(z.string()),
    change_summary: z.string().min(1),
    created_by: ActorSchema,
    created_from: OperationSourceSchema,
    created_at: z.string()
  })
  .strict();
export type DesignVersion = z.infer<typeof DesignVersionSchema>;

export const ValidationStatusSchema = z.enum(["accepted", "rejected", "needs_clarification", "no_op"]);
export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;

export type ValidationResult =
  | {
      status: "accepted";
      operation_id: string;
      new_version_id: string;
      change_summary: string;
      new_version: DesignVersion;
    }
  | {
      status: "rejected";
      operation_id: string;
      reason_code:
        | "unknown_field"
        | "invalid_value"
        | "locked_field"
        | "invalid_measurement"
        | "unsupported_category"
        | "schema_violation"
        | "missing_required_payload"
        | "invalid_version_reference";
      message: string;
      field_path?: string;
    }
  | {
      status: "needs_clarification";
      operation_id: string;
      question: string;
      field_path?: string;
      options?: string[];
    }
  | {
      status: "no_op";
      operation_id: string;
      message: string;
    };
