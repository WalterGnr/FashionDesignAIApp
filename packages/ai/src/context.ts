import type { DesignVersion, DressSpec, LockedField, OperationSource } from "@fashion-design-ai/domain";
import type { NormalizedCommandInput } from "./schemas.js";

export type CommandContext = {
  input: NormalizedCommandInput;
  current_version_id: string;
  design_id: string;
  version_number: number;
  confirmed_fields: Record<string, unknown>;
  assumed_fields: Record<string, unknown>;
  unknown_fields: string[];
  locked_fields: LockedField[];
  recent_versions: Array<{
    version_id: string;
    version_number: number;
    change_summary: string;
  }>;
};

export type BuildCommandContextInput = {
  rawInput: string;
  source?: OperationSource;
  rawInputRef?: string;
  currentVersion: DesignVersion;
  versionHistory?: DesignVersion[];
};

export function normalizeCommandInput(rawInput: string, source: OperationSource = "text", rawInputRef = "raw-input-1"): NormalizedCommandInput {
  const trimmed = rawInput.trim();
  return {
    raw_input: rawInput,
    normalized_input: trimmed.toLowerCase().replace(/\s+/g, " "),
    source,
    raw_input_ref: rawInputRef,
    is_empty: trimmed.length === 0
  };
}

function collectSpecSummary(spec: DressSpec): Pick<CommandContext, "confirmed_fields" | "assumed_fields" | "unknown_fields"> {
  const confirmed_fields: Record<string, unknown> = {};
  const assumed_fields: Record<string, unknown> = {};
  const unknown_fields: string[] = [];

  const visit = (value: unknown, path: string): void => {
    if (!value || typeof value !== "object") {
      return;
    }

    if ("value" in value && "status" in value) {
      const specValue = value as { value: unknown; status: string };
      if (specValue.status === "confirmed") {
        confirmed_fields[path] = specValue.value;
      } else if (specValue.status === "assumed") {
        assumed_fields[path] = specValue.value;
      } else if (specValue.status === "unknown") {
        unknown_fields.push(path);
      }
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      const childPath = path ? `${path}.${key}` : key;
      visit(child, childPath);
    }
  };

  visit(spec, "");

  return {
    confirmed_fields,
    assumed_fields,
    unknown_fields
  };
}

export function buildCommandContext(input: BuildCommandContextInput): CommandContext {
  const normalizedInput = normalizeCommandInput(input.rawInput, input.source ?? "text", input.rawInputRef ?? "raw-input-1");
  const summary = collectSpecSummary(input.currentVersion.spec_snapshot);
  const recentVersions = (input.versionHistory ?? [input.currentVersion]).slice(-5).map((version) => ({
    version_id: version.version_id,
    version_number: version.version_number,
    change_summary: version.change_summary
  }));

  return {
    input: normalizedInput,
    current_version_id: input.currentVersion.version_id,
    design_id: input.currentVersion.design_id,
    version_number: input.currentVersion.version_number,
    locked_fields: input.currentVersion.locked_fields,
    recent_versions: recentVersions,
    ...summary
  };
}

export function buildPromptContextBlock(context: CommandContext): string {
  const lockedFields = context.locked_fields.map((lock) => `- ${lock.field_path}: ${lock.reason}`).join("\n") || "- none";
  const recentVersions = context.recent_versions.map((version) => `- ${version.version_id}: ${version.change_summary}`).join("\n") || "- none";
  const confirmedFields = Object.entries(context.confirmed_fields)
    .map(([fieldPath, value]) => `- ${fieldPath}: ${String(value)}`)
    .join("\n");

  return [
    "You are the AI command interpreter for a dress design app.",
    "Return one structured result: operation_batch, clarification_request, rejection, or no_op.",
    "The structured DressSpec is the source of truth.",
    "Preserve locked fields and make minimal changes.",
    "",
    "Confirmed fields:",
    confirmedFields || "- none",
    "",
    "Locked fields:",
    lockedFields,
    "",
    "Recent versions:",
    recentVersions,
    "",
    "Designer command:",
    context.input.raw_input
  ].join("\n");
}
