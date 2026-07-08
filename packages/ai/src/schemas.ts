import { DesignOperationSchema, OperationSourceSchema } from "@fashion-design-ai/domain";
import { z } from "zod";

export const AIResultTypeSchema = z.enum(["operation_batch", "clarification_request", "rejection", "no_op"]);
export type AIResultType = z.infer<typeof AIResultTypeSchema>;

export const CommandIntentSchema = z.enum([
  "create_or_update_design",
  "modify_existing_detail",
  "add_detail",
  "remove_detail",
  "modify_measurement",
  "lock_or_unlock",
  "create_variation",
  "revert_version",
  "clarification_answer",
  "unsupported_or_out_of_scope"
]);
export type CommandIntent = z.infer<typeof CommandIntentSchema>;

export const ClarificationReasonCodeSchema = z.enum([
  "ambiguous_target",
  "missing_measurement_unit",
  "multiple_possible_details",
  "locked_field_conflict",
  "low_confidence",
  "unsupported_category_ambiguous",
  "insufficient_context"
]);
export type ClarificationReasonCode = z.infer<typeof ClarificationReasonCodeSchema>;

export const AIRejectionReasonCodeSchema = z.enum([
  "unsupported_category",
  "unknown_field",
  "invalid_value",
  "invalid_measurement",
  "schema_violation",
  "locked_field",
  "unsafe_or_sensitive",
  "not_a_design_command",
  "ai_parse_error",
  "unknown_operation_type",
  "missing_required_payload"
]);
export type AIRejectionReasonCode = z.infer<typeof AIRejectionReasonCodeSchema>;

export const AINoOpReasonCodeSchema = z.enum(["already_set", "already_locked", "no_design_change_detected", "duplicate_detail", "empty_input"]);
export type AINoOpReasonCode = z.infer<typeof AINoOpReasonCodeSchema>;

export const AISeveritySchema = z.enum(["info", "warning", "blocking"]);
export type AISeverity = z.infer<typeof AISeveritySchema>;

export const AIAssumptionSchema = z
  .object({
    assumption_id: z.string(),
    field_path: z.string().optional(),
    message: z.string()
  })
  .strict();
export type AIAssumption = z.infer<typeof AIAssumptionSchema>;

export const AIWarningSchema = z
  .object({
    warning_id: z.string(),
    severity: AISeveritySchema,
    field_path: z.string().optional(),
    message: z.string()
  })
  .strict();
export type AIWarning = z.infer<typeof AIWarningSchema>;

const BaseAICommandResultSchema = z
  .object({
    result_id: z.string(),
    raw_input_ref: z.string(),
    confidence: z.number().min(0).max(1),
    command_intent: CommandIntentSchema,
    source: OperationSourceSchema,
    assumptions: z.array(AIAssumptionSchema).default([]),
    warnings: z.array(AIWarningSchema).default([])
  })
  .strict();

export const OperationBatchSchema = z
  .object({
    batch_id: z.string(),
    operations: z.array(DesignOperationSchema).min(1),
    batch_summary: z.string().min(1),
    creates_versions: z.boolean()
  })
  .strict();
export type OperationBatch = z.infer<typeof OperationBatchSchema>;

export const ClarificationRequestSchema = z
  .object({
    clarification_id: z.string(),
    question: z.string().min(1),
    reason_code: ClarificationReasonCodeSchema,
    field_path: z.string().optional(),
    options: z.array(z.string()).optional(),
    allows_free_text: z.boolean()
  })
  .strict();
export type ClarificationRequest = z.infer<typeof ClarificationRequestSchema>;

export const AIRejectionSchema = z
  .object({
    reason_code: AIRejectionReasonCodeSchema,
    message: z.string().min(1),
    field_path: z.string().optional(),
    recoverable: z.boolean()
  })
  .strict();
export type AIRejection = z.infer<typeof AIRejectionSchema>;

export const AINoOpSchema = z
  .object({
    reason_code: AINoOpReasonCodeSchema,
    message: z.string().min(1)
  })
  .strict();
export type AINoOp = z.infer<typeof AINoOpSchema>;

export const OperationBatchResultSchema = BaseAICommandResultSchema.extend({
  result_type: z.literal("operation_batch"),
  operation_batch: OperationBatchSchema,
  clarification_request: z.null().optional(),
  rejection: z.null().optional(),
  no_op: z.null().optional()
}).strict();

export const ClarificationResultSchema = BaseAICommandResultSchema.extend({
  result_type: z.literal("clarification_request"),
  operation_batch: z.null().optional(),
  clarification_request: ClarificationRequestSchema,
  rejection: z.null().optional(),
  no_op: z.null().optional()
}).strict();

export const RejectionResultSchema = BaseAICommandResultSchema.extend({
  result_type: z.literal("rejection"),
  operation_batch: z.null().optional(),
  clarification_request: z.null().optional(),
  rejection: AIRejectionSchema,
  no_op: z.null().optional()
}).strict();

export const NoOpResultSchema = BaseAICommandResultSchema.extend({
  result_type: z.literal("no_op"),
  operation_batch: z.null().optional(),
  clarification_request: z.null().optional(),
  rejection: z.null().optional(),
  no_op: AINoOpSchema
}).strict();

export const AICommandInterpretationResultSchema = z.discriminatedUnion("result_type", [
  OperationBatchResultSchema,
  ClarificationResultSchema,
  RejectionResultSchema,
  NoOpResultSchema
]);
export type AICommandInterpretationResult = z.infer<typeof AICommandInterpretationResultSchema>;

export const NormalizedCommandInputSchema = z
  .object({
    raw_input: z.string(),
    normalized_input: z.string(),
    source: OperationSourceSchema,
    raw_input_ref: z.string(),
    is_empty: z.boolean()
  })
  .strict();
export type NormalizedCommandInput = z.infer<typeof NormalizedCommandInputSchema>;
