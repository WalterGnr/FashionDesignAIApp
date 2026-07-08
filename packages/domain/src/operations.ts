import {
  FIELD_VALUE_SCHEMAS,
  isKnownOperationFieldPath,
  isListFieldPath,
  isLockableFieldPath,
  isMeasurementFieldPath,
  isSettableFieldPath
} from "./paths.js";
import {
  DesignOperationSchema,
  DressSpecSchema,
  EmbellishmentSchema,
  type DesignOperation,
  type DesignVersion,
  type DressSpec,
  type LockedField,
  type Measurement,
  type ValidationResult
} from "./schemas.js";

export type ApplyOperationContext = {
  currentVersion: DesignVersion;
  operation: DesignOperation;
  versionHistory?: DesignVersion[];
  now?: string;
  createId?: (prefix: string) => string;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function defaultCreateId(prefix: string): string {
  const cryptoLike = globalThis as typeof globalThis & {
    crypto?: {
      randomUUID?: () => string;
    };
  };
  const randomId = cryptoLike.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
}

function getPath(root: unknown, fieldPath: string): unknown {
  return fieldPath.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, root);
}

function setPath(root: Record<string, unknown>, fieldPath: string, value: unknown): void {
  const segments = fieldPath.split(".");
  let current: Record<string, unknown> = root;

  for (const segment of segments.slice(0, -1)) {
    const next = current[segment];
    if (!next || typeof next !== "object") {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }

  const finalSegment = segments[segments.length - 1];
  if (!finalSegment) {
    throw new Error(`Invalid field path: ${fieldPath}`);
  }
  current[finalSegment] = value;
}

function isSpecValue(value: unknown): value is { value: unknown; status: string; source: string | null; note?: string } {
  return Boolean(value && typeof value === "object" && "value" in value && "status" in value && "source" in value);
}

export function findLockedFieldConflict(fieldPath: string, lockedFields: LockedField[]): LockedField | undefined {
  return lockedFields.find((lock) => fieldPath === lock.field_path || fieldPath.startsWith(`${lock.field_path}.`));
}

function reject(
  operation: DesignOperation,
  reasonCode: Extract<ValidationResult, { status: "rejected" }>["reason_code"],
  message: string,
  fieldPath?: string
): ValidationResult {
  return {
    status: "rejected",
    operation_id: operation.operation_id,
    reason_code: reasonCode,
    message,
    ...(fieldPath ? { field_path: fieldPath } : {})
  };
}

function noOp(operation: DesignOperation, message: string): ValidationResult {
  return {
    status: "no_op",
    operation_id: operation.operation_id,
    message
  };
}

function needsClarification(operation: DesignOperation, question: string, fieldPath?: string, options?: string[]): ValidationResult {
  return {
    status: "needs_clarification",
    operation_id: operation.operation_id,
    question,
    ...(fieldPath ? { field_path: fieldPath } : {}),
    ...(options ? { options } : {})
  };
}

function operationFieldPath(operation: DesignOperation): string {
  switch (operation.type) {
    case "set_field":
    case "add_detail":
    case "modify_measurement":
    case "lock_field":
    case "unlock_field":
      return operation.payload.field_path;
    case "remove_detail":
      return operation.payload.field_path;
    case "create_variation":
      return operation.target;
    case "revert_to_version":
      return operation.target;
  }
}

function buildVersion(params: {
  context: ApplyOperationContext;
  spec: DressSpec;
  lockedFields: LockedField[];
  changeSummary: string;
  branchId?: string | null;
  variationLabel?: string | null;
}): DesignVersion {
  const { context, spec, lockedFields, changeSummary, branchId = null, variationLabel = null } = params;
  const now = context.now ?? new Date().toISOString();
  const createId = context.createId ?? defaultCreateId;

  return {
    version_id: createId("version"),
    design_id: context.currentVersion.design_id,
    version_number: context.currentVersion.version_number + 1,
    parent_version_id: context.currentVersion.version_id,
    branch_id: branchId,
    variation_label: variationLabel,
    spec_snapshot: spec,
    locked_fields: lockedFields,
    operation_ids: [context.operation.operation_id],
    change_summary: changeSummary,
    created_by: context.operation.actor,
    created_from: context.operation.source,
    created_at: now
  };
}

function accepted(context: ApplyOperationContext, spec: DressSpec, lockedFields: LockedField[], changeSummary: string): ValidationResult {
  const newVersion = buildVersion({ context, spec, lockedFields, changeSummary });
  return {
    status: "accepted",
    operation_id: context.operation.operation_id,
    new_version_id: newVersion.version_id,
    change_summary: changeSummary,
    new_version: newVersion
  };
}

function validateOperationEnvelope(operation: DesignOperation): ValidationResult | null {
  const parsed = DesignOperationSchema.safeParse(operation);
  if (!parsed.success) {
    return {
      status: "rejected",
      operation_id: "operation_id" in operation ? String(operation.operation_id) : "unknown",
      reason_code: "schema_violation",
      message: parsed.error.issues.map((issue) => issue.message).join("; ")
    };
  }

  if (operation.actor === "ai" && operation.confidence === undefined) {
    return reject(operation, "missing_required_payload", "AI-generated operations require confidence.");
  }

  return null;
}

function validateFieldKnown(operation: DesignOperation): ValidationResult | null {
  const fieldPath = operationFieldPath(operation);
  if (operation.type === "revert_to_version" || operation.type === "create_variation") {
    return null;
  }

  if (!isKnownOperationFieldPath(fieldPath)) {
    return reject(operation, "unknown_field", `Unknown field path: ${fieldPath}.`, fieldPath);
  }

  if (operation.target !== fieldPath) {
    return reject(operation, "schema_violation", "Operation target must match payload field_path.", fieldPath);
  }

  return null;
}

function validateLockConflict(operation: DesignOperation, lockedFields: LockedField[]): ValidationResult | null {
  if (operation.type === "unlock_field") {
    return null;
  }

  const fieldPath = operationFieldPath(operation);
  const conflict = findLockedFieldConflict(fieldPath, lockedFields);
  if (conflict) {
    return reject(operation, "locked_field", `${conflict.field_path} is locked. Unlock it before changing this detail.`, conflict.field_path);
  }

  return null;
}

function changeSummaryFor(operation: DesignOperation, fieldPath: string): string {
  switch (operation.type) {
    case "set_field":
      return `Set ${fieldPath}.`;
    case "add_detail":
      return `Added detail to ${fieldPath}.`;
    case "remove_detail":
      return `Removed detail from ${fieldPath}.`;
    case "modify_measurement":
      return `Modified ${fieldPath}.`;
    case "lock_field":
      return `Locked ${fieldPath}.`;
    case "unlock_field":
      return `Unlocked ${fieldPath}.`;
    case "create_variation":
      return `Created variation ${operation.payload.variation_label}.`;
    case "revert_to_version":
      return `Reverted to ${operation.payload.target_version_id}.`;
  }
}

function applySetField(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  if (operation.type !== "set_field") {
    throw new Error("applySetField received the wrong operation type.");
  }

  const fieldPath = operation.payload.field_path;
  if (!isSettableFieldPath(fieldPath)) {
    return reject(operation, "unknown_field", `Field cannot be set directly: ${fieldPath}.`, fieldPath);
  }

  const schema = FIELD_VALUE_SCHEMAS[fieldPath];
  const parsedValue = schema.safeParse(operation.payload.value);
  if (!parsedValue.success) {
    return reject(operation, "invalid_value", parsedValue.error.issues.map((issue) => issue.message).join("; "), fieldPath);
  }

  const nextSpec = clone(context.currentVersion.spec_snapshot);
  const current = getPath(nextSpec, fieldPath);
  const nextValue = {
    value: parsedValue.data,
    status: operation.payload.value_status,
    source: operation.actor === "user" ? "user" : operation.actor
  };

  if (isSpecValue(current) && current.value === nextValue.value && current.status === nextValue.status) {
    return noOp(operation, `${fieldPath} is already set to ${String(nextValue.value)}.`);
  }

  setPath(nextSpec as unknown as Record<string, unknown>, fieldPath, nextValue);
  const parsedSpec = DressSpecSchema.safeParse(nextSpec);
  if (!parsedSpec.success) {
    return reject(operation, "schema_violation", parsedSpec.error.issues.map((issue) => issue.message).join("; "), fieldPath);
  }

  return accepted(context, parsedSpec.data, context.currentVersion.locked_fields, changeSummaryFor(operation, fieldPath));
}

function applyAddDetail(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  if (operation.type !== "add_detail") {
    throw new Error("applyAddDetail received the wrong operation type.");
  }

  const fieldPath = operation.payload.field_path;
  if (!isListFieldPath(fieldPath)) {
    return reject(operation, "unknown_field", `Field cannot receive added details: ${fieldPath}.`, fieldPath);
  }

  const nextSpec = clone(context.currentVersion.spec_snapshot);
  const list = getPath(nextSpec, fieldPath);
  if (!Array.isArray(list)) {
    return reject(operation, "schema_violation", `${fieldPath} is not a list.`, fieldPath);
  }

  let detail: unknown = operation.payload.detail;
  if (fieldPath === "embellishments") {
    const parsed = EmbellishmentSchema.safeParse(detail);
    if (!parsed.success) {
      return reject(operation, "invalid_value", parsed.error.issues.map((issue) => issue.message).join("; "), fieldPath);
    }
    detail = parsed.data;
  }

  const detailId = typeof detail === "object" && detail !== null && "id" in detail ? String((detail as { id: unknown }).id) : null;
  if (detailId && list.some((item) => typeof item === "object" && item !== null && "id" in item && (item as { id: unknown }).id === detailId)) {
    return noOp(operation, `Detail ${detailId} already exists in ${fieldPath}.`);
  }

  setPath(nextSpec as unknown as Record<string, unknown>, fieldPath, [...list, detail]);
  const parsedSpec = DressSpecSchema.safeParse(nextSpec);
  if (!parsedSpec.success) {
    return reject(operation, "schema_violation", parsedSpec.error.issues.map((issue) => issue.message).join("; "), fieldPath);
  }

  return accepted(context, parsedSpec.data, context.currentVersion.locked_fields, changeSummaryFor(operation, fieldPath));
}

function applyModifyMeasurement(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  if (operation.type !== "modify_measurement") {
    throw new Error("applyModifyMeasurement received the wrong operation type.");
  }

  const fieldPath = operation.payload.field_path;
  if (!isMeasurementFieldPath(fieldPath)) {
    return reject(operation, "unknown_field", `Field is not a supported measurement: ${fieldPath}.`, fieldPath);
  }

  const incoming = operation.payload.measurement;
  if (incoming.value !== null && incoming.unit === null) {
    return needsClarification(operation, "Should this measurement use inches or centimeters?", fieldPath, ["in", "cm"]);
  }

  const nextSpec = clone(context.currentVersion.spec_snapshot);
  const current = getPath(nextSpec, fieldPath) as Measurement | undefined;
  if (!current) {
    return reject(operation, "unknown_field", `Measurement path does not exist: ${fieldPath}.`, fieldPath);
  }

  let nextMeasurement: Measurement = incoming;
  if (operation.payload.mode === "adjust") {
    if (current.value === null || current.unit === null) {
      return needsClarification(operation, "Set the current measurement before applying a relative adjustment.", fieldPath);
    }

    if (incoming.value === null || incoming.unit === null) {
      return needsClarification(operation, "Relative measurement adjustments require a value and unit.", fieldPath, ["in", "cm"]);
    }

    if (current.unit !== incoming.unit) {
      return needsClarification(operation, "The adjustment unit must match the current measurement unit for now.", fieldPath, [current.unit]);
    }

    nextMeasurement = {
      ...incoming,
      value: current.value + incoming.value
    };
  }

  if (nextMeasurement.value !== null && nextMeasurement.value < 0) {
    return reject(operation, "invalid_measurement", "Resulting measurement cannot be negative.", fieldPath);
  }

  setPath(nextSpec as unknown as Record<string, unknown>, fieldPath, nextMeasurement);
  const parsedSpec = DressSpecSchema.safeParse(nextSpec);
  if (!parsedSpec.success) {
    return reject(operation, "schema_violation", parsedSpec.error.issues.map((issue) => issue.message).join("; "), fieldPath);
  }

  return accepted(context, parsedSpec.data, context.currentVersion.locked_fields, changeSummaryFor(operation, fieldPath));
}

function applyLockField(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  if (operation.type !== "lock_field") {
    throw new Error("applyLockField received the wrong operation type.");
  }

  const fieldPath = operation.payload.field_path;
  if (!isLockableFieldPath(fieldPath)) {
    return reject(operation, "unknown_field", `Field is not lockable: ${fieldPath}.`, fieldPath);
  }

  const existingLock = context.currentVersion.locked_fields.find((lock) => lock.field_path === fieldPath);
  if (existingLock && existingLock.reason === operation.payload.reason) {
    return noOp(operation, `${fieldPath} is already locked with the same reason.`);
  }

  const createId = context.createId ?? defaultCreateId;
  const now = context.now ?? new Date().toISOString();
  const nextLock: LockedField = {
    lock_id: createId("lock"),
    field_path: fieldPath,
    reason: operation.payload.reason,
    locked_by: operation.actor,
    locked_from: operation.source,
    created_at: now
  };

  const lockedFields = existingLock
    ? context.currentVersion.locked_fields.map((lock) => (lock.field_path === fieldPath ? nextLock : lock))
    : [...context.currentVersion.locked_fields, nextLock];

  return accepted(context, context.currentVersion.spec_snapshot, lockedFields, changeSummaryFor(operation, fieldPath));
}

function applyUnlockField(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  if (operation.type !== "unlock_field") {
    throw new Error("applyUnlockField received the wrong operation type.");
  }

  const fieldPath = operation.payload.field_path;
  const existingLock = context.currentVersion.locked_fields.find((lock) => lock.field_path === fieldPath);
  if (!existingLock) {
    return reject(operation, "unknown_field", `${fieldPath} is not currently locked.`, fieldPath);
  }

  const lockedFields = context.currentVersion.locked_fields.filter((lock) => lock.field_path !== fieldPath);
  return accepted(context, context.currentVersion.spec_snapshot, lockedFields, changeSummaryFor(operation, fieldPath));
}

function applyRemoveDetail(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  if (operation.type !== "remove_detail") {
    throw new Error("applyRemoveDetail received the wrong operation type.");
  }

  const fieldPath = operation.payload.field_path;
  if (!isListFieldPath(fieldPath)) {
    return reject(operation, "unknown_field", `Field cannot remove details: ${fieldPath}.`, fieldPath);
  }

  const nextSpec = clone(context.currentVersion.spec_snapshot);
  const list = getPath(nextSpec, fieldPath);
  if (!Array.isArray(list)) {
    return reject(operation, "schema_violation", `${fieldPath} is not a list.`, fieldPath);
  }

  const nextList = list.filter((item) => !(typeof item === "object" && item !== null && "id" in item && (item as { id: unknown }).id === operation.payload.detail_id));
  if (nextList.length === list.length) {
    return reject(operation, "invalid_value", `Detail ${operation.payload.detail_id} does not exist in ${fieldPath}.`, fieldPath);
  }

  setPath(nextSpec as unknown as Record<string, unknown>, fieldPath, nextList);
  const parsedSpec = DressSpecSchema.safeParse(nextSpec);
  if (!parsedSpec.success) {
    return reject(operation, "schema_violation", parsedSpec.error.issues.map((issue) => issue.message).join("; "), fieldPath);
  }

  return accepted(context, parsedSpec.data, context.currentVersion.locked_fields, changeSummaryFor(operation, fieldPath));
}

function applyRevertToVersion(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  if (operation.type !== "revert_to_version") {
    throw new Error("applyRevertToVersion received the wrong operation type.");
  }

  const target = context.versionHistory?.find((version) => version.version_id === operation.payload.target_version_id);
  if (!target || target.design_id !== context.currentVersion.design_id) {
    return reject(operation, "invalid_version_reference", `Version ${operation.payload.target_version_id} could not be found for this design.`);
  }

  return accepted(context, clone(target.spec_snapshot), clone(target.locked_fields), changeSummaryFor(operation, operation.payload.target_version_id));
}

function applyCreateVariation(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  if (operation.type !== "create_variation") {
    throw new Error("applyCreateVariation received the wrong operation type.");
  }

  if (operation.payload.parent_version_id !== context.currentVersion.version_id) {
    return reject(operation, "invalid_version_reference", "Variation parent must match the current version for this first implementation.");
  }

  const branchId = (context.createId ?? defaultCreateId)("branch");
  const newVersion = buildVersion({
    context,
    spec: clone(context.currentVersion.spec_snapshot),
    lockedFields: clone(context.currentVersion.locked_fields),
    changeSummary: changeSummaryFor(operation, operation.target),
    branchId,
    variationLabel: operation.payload.variation_label
  });

  return {
    status: "accepted",
    operation_id: operation.operation_id,
    new_version_id: newVersion.version_id,
    change_summary: newVersion.change_summary,
    new_version: newVersion
  };
}

export function applyDesignOperation(context: ApplyOperationContext): ValidationResult {
  const { operation } = context;
  const envelopeError = validateOperationEnvelope(operation);
  if (envelopeError) {
    return envelopeError;
  }

  const fieldError = validateFieldKnown(operation);
  if (fieldError) {
    return fieldError;
  }

  const lockError = validateLockConflict(operation, context.currentVersion.locked_fields);
  if (lockError) {
    return lockError;
  }

  switch (operation.type) {
    case "set_field":
      return applySetField(context);
    case "add_detail":
      return applyAddDetail(context);
    case "remove_detail":
      return applyRemoveDetail(context);
    case "modify_measurement":
      return applyModifyMeasurement(context);
    case "lock_field":
      return applyLockField(context);
    case "unlock_field":
      return applyUnlockField(context);
    case "create_variation":
      return applyCreateVariation(context);
    case "revert_to_version":
      return applyRevertToVersion(context);
    default:
      return reject(operation, "schema_violation", "Unsupported operation.");
  }
}
