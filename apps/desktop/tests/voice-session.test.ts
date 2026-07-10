import { afterEach, describe, expect, it, vi } from "vitest";
import { createInitialDesignVersion } from "@fashion-design-ai/domain";
import { nextMockTranscript, VoiceSessionController } from "../src/renderer/src/voice-session.js";

function deterministicRuntime() {
  let index = 0;
  return {
    now: () => "2026-07-08T12:00:00.000Z",
    createId: (prefix: string) => {
      index += 1;
      return `${prefix}-${index}`;
    }
  };
}

function installMediaDevicesMock(impl: () => Promise<MediaStream>) {
  vi.stubGlobal("navigator", {
    mediaDevices: {
      getUserMedia: vi.fn(impl)
    }
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("voice session controller", () => {
  it("starts a local microphone session when permission is granted", async () => {
    const stop = vi.fn();
    installMediaDevicesMock(async () => ({ getTracks: () => [{ stop }] }) as unknown as MediaStream);

    const controller = new VoiceSessionController(deterministicRuntime());
    const snapshot = await controller.start();

    expect(snapshot.state).toBe("listening");
    expect(snapshot.events.map((event) => event.type)).toContain("permission_granted");

    controller.stop();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("records permission denied without throwing", async () => {
    installMediaDevicesMock(async () => {
      throw new DOMException("Denied", "NotAllowedError");
    });

    const controller = new VoiceSessionController(deterministicRuntime());
    const snapshot = await controller.start();

    expect(snapshot.state).toBe("permission_denied");
    expect(snapshot.lastError).toContain("denied");
  });

  it("keeps partial transcripts separate from final command application", () => {
    const controller = new VoiceSessionController(deterministicRuntime());
    const initial = controller.receivePartialTranscript("Make it red");

    expect(initial.state).toBe("listening");
    expect(initial.partialTranscript).toBe("Make it red");
    expect(initial.finalTranscript).toBe("");

    const final = controller.receiveFinalTranscript("Make it red.");
    expect(final.partialTranscript).toBe("");
    expect(final.finalTranscript).toBe("Make it red.");
    expect(final.state).toBe("processing_final_transcript");
  });

  it("applies a final transcript through the designer command path", () => {
    const controller = new VoiceSessionController(deterministicRuntime());
    const initialVersion = createInitialDesignVersion();

    controller.receiveFinalTranscript("Make it a red satin evening gown with off shoulder sleeves.");
    const application = controller.applyFinalTranscript({
      currentVersion: initialVersion,
      versionHistory: [initialVersion]
    });

    expect(application.commandResult.status).toBe("accepted");
    expect(application.commandResult.currentVersion.spec_snapshot.color.primary_color.name.value).toBe("red");
    expect(application.snapshot.state).toBe("listening");
    expect(application.snapshot.finalTranscript).toBe("");
  });

  it("supports deterministic mock transcript cycling", () => {
    expect(nextMockTranscript(0)).toContain("red satin");
    expect(nextMockTranscript(4)).toContain("red satin");
  });
});

