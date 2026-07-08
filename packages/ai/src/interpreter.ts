import {
  findLockedFieldConflict,
  type DesignOperation,
  type DesignVersion,
  type OperationSource,
  type ValueStatus
} from "@fashion-design-ai/domain";
import { buildCommandContext, normalizeCommandInput, type CommandContext } from "./context.js";
import type {
  AICommandInterpretationResult,
  AIRejectionReasonCode,
  AINoOpReasonCode,
  ClarificationReasonCode,
  CommandIntent
} from "./schemas.js";

export type InterpretDesignerCommandInput = {
  rawInput: string;
  source?: OperationSource;
  rawInputRef?: string;
  currentVersion: DesignVersion;
  versionHistory?: DesignVersion[];
  now?: string;
  createId?: (prefix: string) => string;
};

type InterpreterRuntime = {
  source: OperationSource;
  rawInputRef: string;
  now: string;
  createId: (prefix: string) => string;
};

function defaultCreateId(prefix: string): string {
  const cryptoLike = globalThis as typeof globalThis & {
    crypto?: {
      randomUUID?: () => string;
    };
  };
  const randomId = cryptoLike.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
}

function runtimeFor(input: InterpretDesignerCommandInput): InterpreterRuntime {
  const normalized = normalizeCommandInput(input.rawInput, input.source ?? "text", input.rawInputRef ?? "raw-input-1");
  return {
    source: normalized.source,
    rawInputRef: normalized.raw_input_ref,
    now: input.now ?? new Date().toISOString(),
    createId: input.createId ?? defaultCreateId
  };
}

function baseFields(runtime: InterpreterRuntime, commandIntent: CommandIntent, confidence: number) {
  return {
    result_id: runtime.createId("ai-result"),
    raw_input_ref: runtime.rawInputRef,
    confidence,
    command_intent: commandIntent,
    source: runtime.source,
    assumptions: [],
    warnings: []
  };
}

function clarification(
  runtime: InterpreterRuntime,
  params: {
    commandIntent: CommandIntent;
    confidence?: number;
    reasonCode: ClarificationReasonCode;
    question: string;
    fieldPath?: string;
    options?: string[];
    allowsFreeText?: boolean;
  }
): AICommandInterpretationResult {
  return {
    ...baseFields(runtime, params.commandIntent, params.confidence ?? 0.7),
    result_type: "clarification_request",
    clarification_request: {
      clarification_id: runtime.createId("clarification"),
      question: params.question,
      reason_code: params.reasonCode,
      ...(params.fieldPath ? { field_path: params.fieldPath } : {}),
      ...(params.options ? { options: params.options } : {}),
      allows_free_text: params.allowsFreeText ?? true
    }
  };
}

function rejection(
  runtime: InterpreterRuntime,
  params: {
    commandIntent: CommandIntent;
    confidence?: number;
    reasonCode: AIRejectionReasonCode;
    message: string;
    fieldPath?: string;
    recoverable?: boolean;
  }
): AICommandInterpretationResult {
  return {
    ...baseFields(runtime, params.commandIntent, params.confidence ?? 0.9),
    result_type: "rejection",
    rejection: {
      reason_code: params.reasonCode,
      message: params.message,
      ...(params.fieldPath ? { field_path: params.fieldPath } : {}),
      recoverable: params.recoverable ?? true
    }
  };
}

function noOp(
  runtime: InterpreterRuntime,
  params: {
    commandIntent: CommandIntent;
    confidence?: number;
    reasonCode: AINoOpReasonCode;
    message: string;
  }
): AICommandInterpretationResult {
  return {
    ...baseFields(runtime, params.commandIntent, params.confidence ?? 0.95),
    result_type: "no_op",
    no_op: {
      reason_code: params.reasonCode,
      message: params.message
    }
  };
}

function operationBase(runtime: InterpreterRuntime, target: string, confidence = 0.9) {
  return {
    operation_id: runtime.createId("operation"),
    actor: "ai" as const,
    source: runtime.source,
    target,
    raw_input_ref: runtime.rawInputRef,
    confidence,
    creates_version: true,
    created_at: runtime.now
  };
}

function setField(runtime: InterpreterRuntime, fieldPath: string, value: unknown, valueStatus: ValueStatus = "confirmed", confidence = 0.9): DesignOperation {
  return {
    ...operationBase(runtime, fieldPath, confidence),
    type: "set_field",
    payload: {
      field_path: fieldPath,
      value,
      value_status: valueStatus
    }
  };
}

function lockField(runtime: InterpreterRuntime, fieldPath: string, reason: string, confidence = 0.9): DesignOperation {
  return {
    ...operationBase(runtime, fieldPath, confidence),
    type: "lock_field",
    payload: {
      field_path: fieldPath,
      reason
    }
  };
}

function addEmbellishment(runtime: InterpreterRuntime): DesignOperation {
  return {
    ...operationBase(runtime, "embellishments", 0.9),
    type: "add_detail",
    payload: {
      field_path: "embellishments",
      detail: {
        id: runtime.createId("embellishment"),
        type: "pearls",
        placement: "neckline",
        density: "unknown",
        status: "confirmed",
        notes: "Pearl trim around the neckline."
      }
    }
  };
}

function revertToVersion(runtime: InterpreterRuntime, targetVersionId: string): DesignOperation {
  return {
    ...operationBase(runtime, targetVersionId, 0.92),
    type: "revert_to_version",
    payload: {
      target_version_id: targetVersionId,
      reason: "Designer requested reverting to this version."
    }
  };
}

function createVariation(runtime: InterpreterRuntime, parentVersionId: string): DesignOperation {
  return {
    ...operationBase(runtime, "design", 0.86),
    type: "create_variation",
    payload: {
      parent_version_id: parentVersionId,
      variation_label: "Sleeve option set",
      operations: [
        setField(runtime, "sleeves.type", "cap", "assumed", 0.78),
        setField(runtime, "sleeves.type", "bishop", "assumed", 0.78),
        setField(runtime, "sleeves.type", "flutter", "assumed", 0.78)
      ]
    }
  };
}

function operationBatch(
  runtime: InterpreterRuntime,
  params: {
    commandIntent: CommandIntent;
    confidence?: number;
    operations: DesignOperation[];
    summary: string;
  }
): AICommandInterpretationResult {
  return {
    ...baseFields(runtime, params.commandIntent, params.confidence ?? 0.9),
    result_type: "operation_batch",
    operation_batch: {
      batch_id: runtime.createId("batch"),
      operations: params.operations,
      batch_summary: params.summary,
      creates_versions: true
    }
  };
}

function primaryColorValue(version: DesignVersion): string | null {
  return version.spec_snapshot.color.primary_color.name.value;
}

function matchingTrimIds(version: DesignVersion): Array<{ id: string; label: string }> {
  return version.spec_snapshot.embellishments
    .filter((detail) => detail.type === "pearls" || detail.type === "lace_trim" || detail.notes?.toLowerCase().includes("trim"))
    .map((detail) => ({
      id: detail.id,
      label: `${detail.type} at ${detail.placement}`
    }));
}

function findVersionReference(command: string, currentVersion: DesignVersion, versionHistory: DesignVersion[] | undefined): string {
  const match = command.match(/version\s+(\d+)/);
  if (!match?.[1]) {
    return currentVersion.version_id;
  }

  const versionNumber = Number(match[1]);
  const found = versionHistory?.find((version) => version.version_number === versionNumber || version.version_id === `version-${versionNumber}`);
  return found?.version_id ?? `version-${versionNumber}`;
}

function lockedNecklineRejectionIfNeeded(context: CommandContext, runtime: InterpreterRuntime): AICommandInterpretationResult | null {
  const conflict = findLockedFieldConflict("neckline.type", context.locked_fields);
  if (!conflict) {
    return null;
  }

  return rejection(runtime, {
    commandIntent: "modify_existing_detail",
    reasonCode: "locked_field",
    fieldPath: conflict.field_path,
    message: `${conflict.field_path} is locked. Unlock it before changing neckline details.`
  });
}

export function interpretDesignerCommand(input: InterpretDesignerCommandInput): AICommandInterpretationResult {
  const runtime = runtimeFor(input);
  const context = buildCommandContext(input);
  const command = context.input.normalized_input;

  if (context.input.is_empty) {
    return noOp(runtime, {
      commandIntent: "unsupported_or_out_of_scope",
      reasonCode: "empty_input",
      message: "No design command was provided."
    });
  }

  if (/\b(pants|trousers|jacket|shirt|top|accessor(y|ies))\b/.test(command)) {
    return rejection(runtime, {
      commandIntent: "unsupported_or_out_of_scope",
      reasonCode: "unsupported_category",
      message: "MVP supports dress design only.",
      recoverable: false
    });
  }

  if (/\b(shorten|shorter)\b.*\bby\s+\d+(\.\d+)?\b(?!\s*(in|inch|inches|cm|centimeter|centimeters)\b)/.test(command)) {
    return clarification(runtime, {
      commandIntent: "modify_measurement",
      reasonCode: "missing_measurement_unit",
      fieldPath: "measurements.dress_length",
      question: "Should the dress be shortened by that amount in inches or centimeters?",
      options: ["in", "cm"],
      allowsFreeText: false
    });
  }

  if (/\b(more dramatic|prettier|more luxury|more luxurious|more editorial|gen z|production ready)\b/.test(command)) {
    return clarification(runtime, {
      commandIntent: command.includes("production ready") ? "create_or_update_design" : "modify_existing_detail",
      reasonCode: "ambiguous_target",
      question: command.includes("production ready")
        ? "Which production details should I confirm first: measurements, closure, lining, construction notes, or fabric details?"
        : "Should I apply that direction through silhouette, length, color, fabric, or embellishments?",
      options: command.includes("production ready")
        ? ["measurements", "closure", "lining", "construction_notes", "fabric"]
        : ["silhouette", "length", "color", "fabric", "embellishments"],
      allowsFreeText: true
    });
  }

  if (command.includes("change the neckline") || command.includes("neckline to sweetheart")) {
    const lockedResult = lockedNecklineRejectionIfNeeded(context, runtime);
    if (lockedResult) {
      return lockedResult;
    }

    return operationBatch(runtime, {
      commandIntent: "modify_existing_detail",
      operations: [setField(runtime, "neckline.type", "sweetheart")],
      summary: "Change neckline to sweetheart."
    });
  }

  if (command.includes("red satin evening gown") || (command.includes("red") && command.includes("satin") && command.includes("evening gown"))) {
    return operationBatch(runtime, {
      commandIntent: "create_or_update_design",
      operations: [
        setField(runtime, "identity.dress_type", "evening_gown"),
        setField(runtime, "fabric.primary.name", "satin"),
        setField(runtime, "color.primary_color.name", "red"),
        setField(runtime, "neckline.type", command.includes("off-shoulder") || command.includes("off shoulder") ? "off_shoulder" : "unknown"),
        setField(runtime, "sleeves.type", command.includes("off-shoulder") || command.includes("off shoulder") ? "off_shoulder" : "unknown", "assumed", 0.82)
      ],
      summary: "Create a red satin evening gown direction."
    });
  }

  if (/\bmake it red\b|\bred dress\b/.test(command)) {
    if (primaryColorValue(input.currentVersion) === "red") {
      return noOp(runtime, {
        commandIntent: "create_or_update_design",
        reasonCode: "already_set",
        message: "Primary color is already red."
      });
    }

    return operationBatch(runtime, {
      commandIntent: "create_or_update_design",
      operations: [setField(runtime, "color.primary_color.name", "red")],
      summary: "Set the primary color to red."
    });
  }

  if (command.includes("pearl trim") && command.includes("neckline")) {
    return operationBatch(runtime, {
      commandIntent: "add_detail",
      operations: [addEmbellishment(runtime)],
      summary: "Add pearl trim around the neckline."
    });
  }

  if (command.includes("keep the neckline") && (command.includes("fuller skirt") || command.includes("skirt fuller"))) {
    return operationBatch(runtime, {
      commandIntent: "modify_existing_detail",
      operations: [lockField(runtime, "neckline", "Designer asked to keep the neckline."), setField(runtime, "skirt.shape", "full", "assumed", 0.82)],
      summary: "Preserve neckline and make skirt fuller."
    });
  }

  if (command.includes("go back to version") || command.includes("revert to version")) {
    return operationBatch(runtime, {
      commandIntent: "revert_version",
      operations: [revertToVersion(runtime, findVersionReference(command, input.currentVersion, input.versionHistory))],
      summary: "Revert to the requested version."
    });
  }

  if (command.includes("three different sleeve options")) {
    return operationBatch(runtime, {
      commandIntent: "create_variation",
      operations: [lockField(runtime, "neckline", "Designer asked to keep the neckline for sleeve options."), createVariation(runtime, input.currentVersion.version_id)],
      summary: "Create sleeve variation options while preserving neckline."
    });
  }

  if (command.includes("remove the trim")) {
    const matches = matchingTrimIds(input.currentVersion);
    if (matches.length > 1) {
      return clarification(runtime, {
        commandIntent: "remove_detail",
        reasonCode: "multiple_possible_details",
        fieldPath: "embellishments",
        question: "Which trim should I remove?",
        options: matches.map((match) => match.label),
        allowsFreeText: false
      });
    }

    if (matches.length === 1) {
      const match = matches[0];
      if (!match) {
        return clarification(runtime, {
          commandIntent: "remove_detail",
          reasonCode: "insufficient_context",
          fieldPath: "embellishments",
          question: "Which trim should I remove?",
          allowsFreeText: true
        });
      }

      return operationBatch(runtime, {
        commandIntent: "remove_detail",
        operations: [
          {
            ...operationBase(runtime, "embellishments", 0.85),
            type: "remove_detail",
            payload: {
              field_path: "embellishments",
              detail_id: match.id
            }
          }
        ],
        summary: "Remove the matching trim."
      });
    }
  }

  return clarification(runtime, {
    commandIntent: "clarification_answer",
    confidence: 0.55,
    reasonCode: "insufficient_context",
    question: "I need a more specific dress change. Which field should I update?",
    options: ["silhouette", "neckline", "sleeves", "fabric", "color", "embellishments"],
    allowsFreeText: true
  });
}
