import {
  applyDesignOperation,
  type ApplyOperationContext,
  type DesignVersion,
  type ValidationResult
} from "@fashion-design-ai/domain";
import { AICommandInterpretationResultSchema, type AICommandInterpretationResult } from "./schemas.js";

export type ExecuteAICommandResultInput = {
  result: unknown;
  currentVersion: DesignVersion;
  versionHistory?: DesignVersion[];
  now?: string;
  createId?: (prefix: string) => string;
};

export type AICommandExecutionOutcome =
  | {
      status: "accepted";
      result_id: string;
      batch_summary: string;
      operation_results: Array<Extract<ValidationResult, { status: "accepted" }>>;
      final_version: DesignVersion;
    }
  | {
      status: "rejected";
      result_id: string;
      reason_code: string;
      message: string;
      field_path?: string;
      operation_results?: ValidationResult[];
    }
  | {
      status: "needs_clarification";
      result_id: string;
      question: string;
      field_path?: string;
      options?: string[];
    }
  | {
      status: "no_op";
      result_id: string;
      message: string;
    };

function schemaRejection(errorMessage: string): AICommandExecutionOutcome {
  return {
    status: "rejected",
    result_id: "unknown",
    reason_code: "schema_violation",
    message: errorMessage
  };
}

function lowConfidenceClarification(result: AICommandInterpretationResult): AICommandExecutionOutcome | null {
  if (result.confidence >= 0.6 || result.result_type !== "operation_batch") {
    return null;
  }

  return {
    status: "needs_clarification",
    result_id: result.result_id,
    question: "I am not confident enough to safely apply that design change. Can you clarify the target detail?",
    options: ["silhouette", "neckline", "sleeves", "fabric", "color", "embellishments"]
  };
}

export function executeAICommandResult(input: ExecuteAICommandResultInput): AICommandExecutionOutcome {
  const parsed = AICommandInterpretationResultSchema.safeParse(input.result);
  if (!parsed.success) {
    return schemaRejection(parsed.error.issues.map((issue) => issue.message).join("; "));
  }

  const result = parsed.data;
  const lowConfidence = lowConfidenceClarification(result);
  if (lowConfidence) {
    return lowConfidence;
  }

  switch (result.result_type) {
    case "clarification_request":
      return {
        status: "needs_clarification",
        result_id: result.result_id,
        question: result.clarification_request.question,
        ...(result.clarification_request.field_path ? { field_path: result.clarification_request.field_path } : {}),
        ...(result.clarification_request.options ? { options: result.clarification_request.options } : {})
      };
    case "rejection":
      return {
        status: "rejected",
        result_id: result.result_id,
        reason_code: result.rejection.reason_code,
        message: result.rejection.message,
        ...(result.rejection.field_path ? { field_path: result.rejection.field_path } : {})
      };
    case "no_op":
      return {
        status: "no_op",
        result_id: result.result_id,
        message: result.no_op.message
      };
    case "operation_batch": {
      let workingVersion = input.currentVersion;
      const operationResults: ValidationResult[] = [];

      for (const operation of result.operation_batch.operations) {
        const operationContext: ApplyOperationContext = {
          currentVersion: workingVersion,
          operation,
          ...(input.versionHistory ? { versionHistory: input.versionHistory } : {}),
          ...(input.now ? { now: input.now } : {}),
          ...(input.createId ? { createId: input.createId } : {})
        };
        const operationResult = applyDesignOperation(operationContext);

        operationResults.push(operationResult);

        if (operationResult.status === "accepted") {
          workingVersion = operationResult.new_version;
          continue;
        }

        if (operationResult.status === "needs_clarification") {
          return {
            status: "needs_clarification",
            result_id: result.result_id,
            question: operationResult.question,
            ...(operationResult.field_path ? { field_path: operationResult.field_path } : {}),
            ...(operationResult.options ? { options: operationResult.options } : {})
          };
        }

        if (operationResult.status === "no_op") {
          return {
            status: "no_op",
            result_id: result.result_id,
            message: operationResult.message
          };
        }

        return {
          status: "rejected",
          result_id: result.result_id,
          reason_code: operationResult.reason_code,
          message: operationResult.message,
          ...(operationResult.field_path ? { field_path: operationResult.field_path } : {}),
          operation_results: operationResults
        };
      }

      return {
        status: "accepted",
        result_id: result.result_id,
        batch_summary: result.operation_batch.batch_summary,
        operation_results: operationResults as Array<Extract<ValidationResult, { status: "accepted" }>>,
        final_version: workingVersion
      };
    }
  }
}
