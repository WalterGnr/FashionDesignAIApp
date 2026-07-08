import type { DesignVersion, OperationSource } from "@fashion-design-ai/domain";
import { executeAICommandResult, type AICommandExecutionOutcome } from "./executor.js";
import { interpretDesignerCommand } from "./interpreter.js";
import type { AICommandInterpretationResult } from "./schemas.js";

export type InterpretAndApplyInput = {
  rawInput: string;
  source?: OperationSource;
  rawInputRef?: string;
  currentVersion: DesignVersion;
  versionHistory?: DesignVersion[];
  now?: string;
  createId?: (prefix: string) => string;
};

export type InterpretAndApplyResult = {
  proposed_result: AICommandInterpretationResult;
  execution: AICommandExecutionOutcome;
};

export function interpretAndApplyDesignerCommand(input: InterpretAndApplyInput): InterpretAndApplyResult {
  const proposedResult = interpretDesignerCommand(input);
  const execution = executeAICommandResult({
    result: proposedResult,
    currentVersion: input.currentVersion,
    ...(input.versionHistory ? { versionHistory: input.versionHistory } : {}),
    ...(input.now ? { now: input.now } : {}),
    ...(input.createId ? { createId: input.createId } : {})
  });

  return {
    proposed_result: proposedResult,
    execution
  };
}
