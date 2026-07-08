import { z } from "zod";
import {
  ClosurePlacementSchema,
  ClosureTypeSchema,
  DressTypeSchema,
  FabricDrapeSchema,
  FabricNameSchema,
  FabricStretchSchema,
  FabricWeightSchema,
  FinishSchema,
  LengthCategorySchema,
  NecklineDepthSchema,
  NecklineTypeSchema,
  OccasionSchema,
  SeasonSchema,
  SilhouetteSchema,
  SkirtShapeSchema,
  SleeveLengthCategorySchema,
  SleeveTypeSchema
} from "./schemas.js";

export const FIELD_VALUE_SCHEMAS = {
  "identity.dress_type": DressTypeSchema,
  "identity.occasion": OccasionSchema,
  "identity.season": SeasonSchema,
  "silhouette": SilhouetteSchema,
  "neckline.type": NecklineTypeSchema,
  "neckline.depth": NecklineDepthSchema,
  "sleeves.type": SleeveTypeSchema,
  "sleeves.length_category": SleeveLengthCategorySchema,
  "skirt.shape": SkirtShapeSchema,
  "length.category": LengthCategorySchema,
  "fabric.primary.name": FabricNameSchema,
  "fabric.primary.weight": FabricWeightSchema,
  "fabric.primary.drape": FabricDrapeSchema,
  "fabric.primary.stretch": FabricStretchSchema,
  "fabric.primary.finish": FinishSchema,
  "color.primary_color.name": z.string().min(1),
  "color.finish": FinishSchema,
  "closures.type": ClosureTypeSchema,
  "closures.placement": ClosurePlacementSchema
} as const;

export type SettableFieldPath = keyof typeof FIELD_VALUE_SCHEMAS;

export const MEASUREMENT_FIELD_PATHS = [
  "measurements.bust",
  "measurements.waist",
  "measurements.hip",
  "measurements.shoulder_width",
  "measurements.back_length",
  "measurements.front_length",
  "measurements.sleeve_length",
  "measurements.bicep",
  "measurements.wrist",
  "measurements.dress_length",
  "measurements.hem_circumference",
  "measurements.train_length",
  "sleeves.measurement",
  "length.front_measurement",
  "length.back_measurement",
  "length.train_length"
] as const;

export const LIST_FIELD_PATHS = [
  "embellishments",
  "skirt.features",
  "construction_notes",
  "pattern_notes",
  "warnings",
  "assumptions"
] as const;

export const LOCKABLE_FIELD_PATHS = [
  "identity.dress_type",
  "silhouette",
  "neckline",
  "neckline.type",
  "sleeves",
  "sleeves.type",
  "bodice",
  "skirt",
  "length",
  "fabric",
  "fabric.primary",
  "color",
  "color.primary_color",
  "embellishments",
  "closures",
  "lining",
  "measurements",
  "construction_notes",
  "pattern_notes"
] as const;

export function isSettableFieldPath(fieldPath: string): fieldPath is SettableFieldPath {
  return Object.prototype.hasOwnProperty.call(FIELD_VALUE_SCHEMAS, fieldPath);
}

export function isMeasurementFieldPath(fieldPath: string): fieldPath is (typeof MEASUREMENT_FIELD_PATHS)[number] {
  return (MEASUREMENT_FIELD_PATHS as readonly string[]).includes(fieldPath);
}

export function isListFieldPath(fieldPath: string): fieldPath is (typeof LIST_FIELD_PATHS)[number] {
  return (LIST_FIELD_PATHS as readonly string[]).includes(fieldPath);
}

export function isLockableFieldPath(fieldPath: string): fieldPath is (typeof LOCKABLE_FIELD_PATHS)[number] {
  return (LOCKABLE_FIELD_PATHS as readonly string[]).includes(fieldPath);
}

export function isKnownOperationFieldPath(fieldPath: string): boolean {
  return isSettableFieldPath(fieldPath) || isMeasurementFieldPath(fieldPath) || isListFieldPath(fieldPath) || isLockableFieldPath(fieldPath);
}
