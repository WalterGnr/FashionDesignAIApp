import { interpretAndApplyDesignerCommand, type InterpretAndApplyResult } from "@fashion-design-ai/ai";
import type { DesignVersion, DressSpec, LockedField, OperationSource, ValueStatus } from "@fashion-design-ai/domain";

export type CommandStatus = "idle" | "interpreting" | "accepted" | "rejected" | "needs_clarification" | "no_op";

export type FieldRow = {
  label: string;
  path: string;
  value: string;
  status: ValueStatus | "locked";
};

export type DesignerCommandResult = {
  status: CommandStatus;
  interpretation: InterpretAndApplyResult["proposed_result"];
  execution: InterpretAndApplyResult["execution"];
  currentVersion: DesignVersion;
  versionHistory: DesignVersion[];
  acceptedVersions: DesignVersion[];
};

type ApplyDesignerTextCommandInput = {
  rawInput: string;
  source?: OperationSource;
  currentVersion: DesignVersion;
  versionHistory: DesignVersion[];
  now?: string;
  createId?: (prefix: string) => string;
};

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "unknown") {
    return "Unknown";
  }

  return String(value).replaceAll("_", " ");
}

function specValueRow(
  params: {
    label: string;
    path: string;
    value: { value: unknown; status: ValueStatus };
    lockedFields: LockedField[];
  }
): FieldRow {
  const locked = params.lockedFields.some((field) => params.path === field.field_path || params.path.startsWith(`${field.field_path}.`));
  return {
    label: params.label,
    path: params.path,
    value: displayValue(params.value.value),
    status: locked ? "locked" : params.value.status
  };
}

export function fieldRowsFromSpec(spec: DressSpec, lockedFields: LockedField[]): FieldRow[] {
  return [
    specValueRow({ label: "Dress Type", path: "identity.dress_type", value: spec.identity.dress_type, lockedFields }),
    specValueRow({ label: "Occasion", path: "identity.occasion", value: spec.identity.occasion, lockedFields }),
    specValueRow({ label: "Silhouette", path: "silhouette", value: spec.silhouette, lockedFields }),
    specValueRow({ label: "Neckline", path: "neckline.type", value: spec.neckline.type, lockedFields }),
    specValueRow({ label: "Sleeves", path: "sleeves.type", value: spec.sleeves.type, lockedFields }),
    specValueRow({ label: "Skirt Shape", path: "skirt.shape", value: spec.skirt.shape, lockedFields }),
    specValueRow({ label: "Length", path: "length.category", value: spec.length.category, lockedFields }),
    specValueRow({ label: "Fabric", path: "fabric.primary.name", value: spec.fabric.primary.name, lockedFields }),
    specValueRow({ label: "Primary Color", path: "color.primary_color.name", value: spec.color.primary_color.name, lockedFields }),
    specValueRow({ label: "Closure", path: "closures.type", value: spec.closures.type, lockedFields }),
    specValueRow({ label: "Lining", path: "lining.coverage", value: spec.lining.coverage, lockedFields })
  ];
}

export function applyDesignerTextCommand(input: ApplyDesignerTextCommandInput): DesignerCommandResult {
  const outcome = interpretAndApplyDesignerCommand({
    rawInput: input.rawInput,
    source: input.source ?? "text",
    rawInputRef: `desktop-command-${input.versionHistory.length + 1}`,
    currentVersion: input.currentVersion,
    versionHistory: input.versionHistory,
    ...(input.now ? { now: input.now } : {}),
    ...(input.createId ? { createId: input.createId } : {})
  });

  if (outcome.execution.status !== "accepted") {
    return {
      status: outcome.execution.status,
      interpretation: outcome.proposed_result,
      execution: outcome.execution,
      currentVersion: input.currentVersion,
      versionHistory: input.versionHistory,
      acceptedVersions: []
    };
  }

  const acceptedVersions = outcome.execution.operation_results.map((result) => result.new_version);

  return {
    status: "accepted",
    interpretation: outcome.proposed_result,
    execution: outcome.execution,
    currentVersion: outcome.execution.final_version,
    versionHistory: [...input.versionHistory, ...acceptedVersions],
    acceptedVersions
  };
}

export function commandStatusLabel(status: CommandStatus): string {
  const labels: Record<CommandStatus, string> = {
    idle: "Ready",
    interpreting: "Interpreting",
    accepted: "Accepted",
    rejected: "Rejected",
    needs_clarification: "Clarification",
    no_op: "No change"
  };

  return labels[status];
}
