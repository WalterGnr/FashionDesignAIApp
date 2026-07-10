import type { DesignVersion } from "@fashion-design-ai/domain";
import { applyDesignerTextCommand, type DesignerCommandResult } from "./designer-session.js";

export type VoiceSessionState =
  | "idle"
  | "requesting_permission"
  | "connecting"
  | "listening"
  | "processing_final_transcript"
  | "applying_command"
  | "needs_clarification"
  | "interrupted"
  | "permission_denied"
  | "error";

export type VoiceEventType =
  | "permission_requested"
  | "permission_granted"
  | "permission_denied"
  | "session_connected"
  | "partial_transcript"
  | "final_transcript"
  | "command_applied"
  | "clarification_required"
  | "command_rejected"
  | "no_op"
  | "interrupted"
  | "stopped"
  | "error";

export type VoiceEventRecord = {
  event_id: string;
  type: VoiceEventType;
  created_at: string;
  partial_transcript?: string;
  final_transcript?: string;
  command_result_id?: string;
  message?: string;
};

export type VoiceSessionSnapshot = {
  state: VoiceSessionState;
  partialTranscript: string;
  finalTranscript: string;
  events: VoiceEventRecord[];
  lastError: string | null;
};

export type VoiceCommandApplication = {
  snapshot: VoiceSessionSnapshot;
  commandResult: DesignerCommandResult;
};

type Runtime = {
  now?: () => string;
  createId?: (prefix: string) => string;
};

type ApplyFinalTranscriptInput = {
  currentVersion: DesignVersion;
  versionHistory: DesignVersion[];
};

const SAMPLE_TRANSCRIPTS = [
  "Make it a red satin evening gown with off shoulder sleeves.",
  "Keep the neckline and make the skirt fuller.",
  "Add pearl trim around the neckline.",
  "Make it more dramatic."
] as const;

function defaultNow(): string {
  return new Date().toISOString();
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

function hasMediaDevices(): boolean {
  return Boolean(globalThis.navigator?.mediaDevices?.getUserMedia);
}

function isPermissionDenied(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");
}

export function nextMockTranscript(index: number): string {
  return SAMPLE_TRANSCRIPTS[index % SAMPLE_TRANSCRIPTS.length] ?? "Make it a red satin evening gown with off shoulder sleeves.";
}

export class VoiceSessionController {
  private state: VoiceSessionState = "idle";
  private partialTranscript = "";
  private finalTranscript = "";
  private events: VoiceEventRecord[] = [];
  private lastError: string | null = null;
  private mediaStream: MediaStream | null = null;
  private readonly now: () => string;
  private readonly createId: (prefix: string) => string;

  constructor(runtime: Runtime = {}) {
    this.now = runtime.now ?? defaultNow;
    this.createId = runtime.createId ?? defaultCreateId;
  }

  snapshot(): VoiceSessionSnapshot {
    return {
      state: this.state,
      partialTranscript: this.partialTranscript,
      finalTranscript: this.finalTranscript,
      events: [...this.events],
      lastError: this.lastError
    };
  }

  async start(): Promise<VoiceSessionSnapshot> {
    this.transition("requesting_permission");
    this.record("permission_requested");

    if (!hasMediaDevices()) {
      this.transition("error", "Microphone capture is not available in this environment.");
      this.record("error", { message: this.lastError ?? "Microphone unavailable." });
      return this.snapshot();
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.record("permission_granted");
      this.transition("connecting");
      this.record("session_connected", { message: "Local microphone session ready. Realtime backend broker is not connected yet." });
      this.transition("listening");
      return this.snapshot();
    } catch (error) {
      if (isPermissionDenied(error)) {
        this.transition("permission_denied", "Microphone permission was denied.");
        this.record("permission_denied", { message: this.lastError ?? "Microphone permission denied." });
        return this.snapshot();
      }

      this.transition("error", error instanceof Error ? error.message : "Could not start microphone capture.");
      this.record("error", { message: this.lastError ?? "Voice session error." });
      return this.snapshot();
    }
  }

  stop(): VoiceSessionSnapshot {
    this.stopMediaStream();
    this.partialTranscript = "";
    this.transition("idle");
    this.record("stopped");
    return this.snapshot();
  }

  interrupt(message = "Voice command canceled before a final transcript was applied."): VoiceSessionSnapshot {
    this.partialTranscript = "";
    this.finalTranscript = "";
    this.transition("interrupted");
    this.record("interrupted", { message });
    return this.snapshot();
  }

  receivePartialTranscript(text: string): VoiceSessionSnapshot {
    if (this.state !== "listening") {
      this.transition("listening");
    }

    this.partialTranscript = text;
    this.record("partial_transcript", { partialTranscript: text });
    return this.snapshot();
  }

  receiveFinalTranscript(text: string): VoiceSessionSnapshot {
    this.partialTranscript = "";
    this.finalTranscript = text.trim();
    this.transition("processing_final_transcript");
    this.record("final_transcript", { finalTranscript: this.finalTranscript });
    return this.snapshot();
  }

  applyFinalTranscript(input: ApplyFinalTranscriptInput): VoiceCommandApplication {
    if (!this.finalTranscript) {
      this.transition("error", "No final transcript is ready to apply.");
      this.record("error", { message: this.lastError ?? "Missing final transcript." });
      const commandResult = applyDesignerTextCommand({
        rawInput: "",
        currentVersion: input.currentVersion,
        versionHistory: input.versionHistory
      });
      return {
        snapshot: this.snapshot(),
        commandResult
      };
    }

    this.transition("applying_command");
    const commandResult = applyDesignerTextCommand({
      rawInput: this.finalTranscript,
      source: "voice",
      currentVersion: input.currentVersion,
      versionHistory: input.versionHistory
    });

    if (commandResult.status === "accepted") {
      this.transition("listening");
      this.record("command_applied", {
        finalTranscript: this.finalTranscript,
        commandResultId: commandResult.execution.result_id
      });
    } else if (commandResult.status === "needs_clarification") {
      this.transition("needs_clarification");
      this.record("clarification_required", {
        finalTranscript: this.finalTranscript,
        commandResultId: commandResult.execution.result_id
      });
    } else if (commandResult.status === "rejected") {
      this.transition("listening");
      this.record("command_rejected", {
        finalTranscript: this.finalTranscript,
        commandResultId: commandResult.execution.result_id
      });
    } else {
      this.transition("listening");
      this.record("no_op", {
        finalTranscript: this.finalTranscript,
        commandResultId: commandResult.execution.result_id
      });
    }

    this.finalTranscript = "";

    return {
      snapshot: this.snapshot(),
      commandResult
    };
  }

  private transition(state: VoiceSessionState, error: string | null = null): void {
    this.state = state;
    this.lastError = error;
  }

  private record(
    type: VoiceEventType,
    params: {
      partialTranscript?: string;
      finalTranscript?: string;
      commandResultId?: string;
      message?: string;
    } = {}
  ): void {
    this.events = [
      {
        event_id: this.createId("voice-event"),
        type,
        created_at: this.now(),
        ...(params.partialTranscript ? { partial_transcript: params.partialTranscript } : {}),
        ...(params.finalTranscript ? { final_transcript: params.finalTranscript } : {}),
        ...(params.commandResultId ? { command_result_id: params.commandResultId } : {}),
        ...(params.message ? { message: params.message } : {})
      },
      ...this.events
    ].slice(0, 12);
  }

  private stopMediaStream(): void {
    if (!this.mediaStream) {
      return;
    }

    for (const track of this.mediaStream.getTracks()) {
      track.stop();
    }

    this.mediaStream = null;
  }
}
