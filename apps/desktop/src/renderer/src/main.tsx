import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  History,
  LockKeyhole,
  Mic,
  MicOff,
  Images,
  PanelRight,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { createInitialDesignVersion } from "@fashion-design-ai/domain";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AppInfo, DesktopResponse, HealthPingResult } from "../../shared/ipc-contracts.js";
import {
  applyDesignerTextCommand,
  commandStatusLabel,
  fieldRowsFromSpec,
  type CommandStatus,
  type DesignerCommandResult
} from "./designer-session.js";
import { nextMockTranscript, VoiceSessionController, type VoiceSessionSnapshot } from "./voice-session.js";
import { DressPreviewCanvas } from "./preview/DressPreviewCanvas.js";
import { mapDressSpecToPreview } from "./preview/preview-mapper.js";
import { ConceptRenderWorkspace } from "./ConceptRenderWorkspace.js";
import "./styles.css";

type ShellStatus = "checking" | "ready" | "error";
type PreviewMode = "three_d" | "concept";

type LatestCommand = {
  rawInput: string;
  result: DesignerCommandResult;
};

function responseLabel<T>(response: DesktopResponse<T> | null): string {
  if (!response) {
    return "Pending";
  }

  return response.ok ? "Ready" : response.message;
}

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === "unknown") {
    return "Unknown";
  }

  return String(value).replaceAll("_", " ");
}

function confidenceText(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function statusIcon(status: CommandStatus) {
  switch (status) {
    case "accepted":
      return <CheckCircle2 size={16} aria-hidden="true" />;
    case "rejected":
      return <AlertTriangle size={16} aria-hidden="true" />;
    case "needs_clarification":
      return <Sparkles size={16} aria-hidden="true" />;
    case "no_op":
      return <Clock3 size={16} aria-hidden="true" />;
    default:
      return <Sparkles size={16} aria-hidden="true" />;
  }
}

function App() {
  const initialVersion = useMemo(() => createInitialDesignVersion(), []);
  const commandInputRef = useRef<HTMLInputElement | null>(null);
  const voiceControllerRef = useRef(new VoiceSessionController());
  const [appInfo, setAppInfo] = useState<DesktopResponse<AppInfo> | null>(null);
  const [health, setHealth] = useState<DesktopResponse<HealthPingResult> | null>(null);
  const [shellStatus, setShellStatus] = useState<ShellStatus>("checking");
  const [commandStatus, setCommandStatus] = useState<CommandStatus>("idle");
  const [commandInput, setCommandInput] = useState("");
  const [currentVersion, setCurrentVersion] = useState(initialVersion);
  const [versionHistory, setVersionHistory] = useState([initialVersion]);
  const [selectedVersionId, setSelectedVersionId] = useState(initialVersion.version_id);
  const [latestCommand, setLatestCommand] = useState<LatestCommand | null>(null);
  const [voiceSnapshot, setVoiceSnapshot] = useState<VoiceSessionSnapshot>(() => voiceControllerRef.current.snapshot());
  const [mockTranscriptIndex, setMockTranscriptIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("three_d");

  const selectedVersion = versionHistory.find((version) => version.version_id === selectedVersionId) ?? currentVersion;
  const selectedSpec = selectedVersion.spec_snapshot;
  const fieldRows = useMemo(() => fieldRowsFromSpec(selectedSpec, selectedVersion.locked_fields), [selectedSpec, selectedVersion.locked_fields]);
  const previewParameters = useMemo(() => mapDressSpecToPreview(selectedSpec), [selectedSpec]);
  const isViewingCurrent = selectedVersion.version_id === currentVersion.version_id;

  async function refreshHealth() {
    if (!window.fashionDesktop) {
      setShellStatus("ready");
      return;
    }
    const ping = await window.fashionDesktop.health.ping({ request_id: "designer-workspace" });
    setHealth(ping);
    setShellStatus(ping.ok ? "ready" : "error");
  }

  useEffect(() => {
    let active = true;

    async function loadDesktopState() {
      if (!window.fashionDesktop) {
        setShellStatus("ready");
        return;
      }
      const [info, ping] = await Promise.all([window.fashionDesktop.app.getInfo(), window.fashionDesktop.health.ping({ request_id: "startup" })]);
      if (!active) {
        return;
      }

      setAppInfo(info);
      setHealth(ping);
      setShellStatus(info.ok && ping.ok ? "ready" : "error");
    }

    void loadDesktopState();
    commandInputRef.current?.focus();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") {
        event.preventDefault();
        commandInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  async function openProjectDocs() {
    if (!window.fashionDesktop) {
      window.open("https://github.com/WalterGnr/FashionDesignAIApp", "_blank", "noopener,noreferrer");
      return;
    }
    await window.fashionDesktop.shell.openExternal({
      url: "https://github.com/WalterGnr/FashionDesignAIApp"
    });
  }

  function applyCommandResult(rawInput: string, result: DesignerCommandResult) {
    setLatestCommand({ rawInput, result });
    setCommandStatus(result.status);

    if (result.status === "accepted") {
      setCurrentVersion(result.currentVersion);
      setVersionHistory(result.versionHistory);
      setSelectedVersionId(result.currentVersion.version_id);
    }
  }

  function applyCommand() {
    const rawInput = commandInput.trim();
    if (!rawInput) {
      return;
    }

    setCommandStatus("interpreting");

    const result = applyDesignerTextCommand({
      rawInput,
      currentVersion,
      versionHistory
    });

    applyCommandResult(rawInput, result);
    if (result.status === "accepted") {
      setCommandInput("");
    }
  }

  async function toggleVoiceSession() {
    if (voiceSnapshot.state === "listening") {
      setVoiceSnapshot(voiceControllerRef.current.stop());
      return;
    }

    setVoiceSnapshot(voiceControllerRef.current.snapshot());
    const nextSnapshot = await voiceControllerRef.current.start();
    setVoiceSnapshot(nextSnapshot);
  }

  function simulateTranscript() {
    const transcript = nextMockTranscript(mockTranscriptIndex);
    setMockTranscriptIndex((index) => index + 1);
    voiceControllerRef.current.receivePartialTranscript(transcript.slice(0, Math.max(18, Math.floor(transcript.length * 0.58))));
    const finalSnapshot = voiceControllerRef.current.receiveFinalTranscript(transcript);
    setVoiceSnapshot(finalSnapshot);
  }

  function applyVoiceTranscript() {
    const rawInput = voiceSnapshot.finalTranscript.trim();
    if (!rawInput) {
      return;
    }

    setCommandStatus("interpreting");
    const application = voiceControllerRef.current.applyFinalTranscript({
      currentVersion,
      versionHistory
    });
    setVoiceSnapshot(application.snapshot);
    applyCommandResult(rawInput, application.commandResult);
  }

  function cancelVoiceTranscript() {
    setVoiceSnapshot(voiceControllerRef.current.interrupt());
  }

  const operationList =
    latestCommand?.result.interpretation.result_type === "operation_batch" ? latestCommand.result.interpretation.operation_batch.operations : [];
  const execution = latestCommand?.result.execution;

  return (
    <main className="workspace-shell">
      <header className="command-bar">
        <section className="brand-block" aria-label="Current app">
          <span className="brand-mark">FD</span>
          <div>
            <h1>Fashion Design AI</h1>
            <p>{appInfo?.ok ? appInfo.data.environment : "desktop"}</p>
          </div>
        </section>

        <form
          className="command-form"
          onSubmit={(event) => {
            event.preventDefault();
            applyCommand();
          }}
        >
          <button
            type="button"
            className={`icon-button voice-toggle ${voiceSnapshot.state}`}
            title={voiceSnapshot.state === "listening" ? "Stop listening" : "Start voice session"}
            onClick={toggleVoiceSession}
          >
            {voiceSnapshot.state === "listening" ? <MicOff size={17} aria-hidden="true" /> : <Mic size={17} aria-hidden="true" />}
            <span className="sr-only">Voice input</span>
          </button>
          <label className="sr-only" htmlFor="designer-command">
            Designer command
          </label>
          <input
            id="designer-command"
            ref={commandInputRef}
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value)}
            placeholder="Make it a red satin evening gown"
          />
          <button type="submit" className="primary-action">
            <Send size={16} aria-hidden="true" />
            <span>Apply</span>
          </button>
        </form>

        <section className="top-actions" aria-label="Workspace actions">
          <span className={`status-pill ${commandStatus}`}>{commandStatusLabel(commandStatus)}</span>
          <button type="button" className="icon-button" title="Refresh shell health" onClick={refreshHealth}>
            <RefreshCw size={16} aria-hidden="true" />
            <span className="sr-only">Refresh shell health</span>
          </button>
          <button type="button" className="icon-button" title="Tech pack export is planned for a later sprint" disabled>
            <Download size={16} aria-hidden="true" />
            <span className="sr-only">Export tech pack</span>
          </button>
          <button type="button" className="icon-button" title="Open project repository" onClick={openProjectDocs}>
            <ExternalLink size={16} aria-hidden="true" />
            <span className="sr-only">Open repository</span>
          </button>
        </section>
      </header>

      <section className="workspace-grid">
        <section className="preview-plane" aria-label="Design preview workspace">
          <div className="preview-stage">
            <div className="preview-toolbar" aria-label="Selected design summary">
              <div className="preview-mode-switch" aria-label="Preview mode">
                <button
                  type="button"
                  className={previewMode === "three_d" ? "selected" : ""}
                  aria-pressed={previewMode === "three_d"}
                  onClick={() => setPreviewMode("three_d")}
                >
                  <Box size={14} aria-hidden="true" />
                  <span>3D Preview</span>
                </button>
                <button
                  type="button"
                  className={previewMode === "concept" ? "selected" : ""}
                  aria-pressed={previewMode === "concept"}
                  onClick={() => setPreviewMode("concept")}
                >
                  <Images size={14} aria-hidden="true" />
                  <span>Concept Renders</span>
                </button>
              </div>
              <div className="preview-context">
                <span>{isViewingCurrent ? "Current" : "Inspecting"}</span>
                <span>Version {selectedVersion.version_number}</span>
                <span>{valueText(selectedSpec.identity.dress_type.value)}</span>
              </div>
            </div>

            {previewMode === "three_d" ? (
              <DressPreviewCanvas parameters={previewParameters} versionId={selectedVersion.version_id} />
            ) : (
              <ConceptRenderWorkspace selectedVersion={selectedVersion} desktopApi={window.fashionDesktop} />
            )}

            <div className="preview-spec-strip" aria-label="Visible spec summary">
              <span>{previewParameters.labels.color}</span>
              <span>{previewParameters.labels.fabric}</span>
              <span>{previewParameters.labels.neckline}</span>
              <span>{previewParameters.labels.skirt}</span>
            </div>
          </div>

          <footer className="preview-footer">
            <span>{selectedVersion.change_summary}</span>
            <span>{selectedVersion.created_from}</span>
          </footer>
        </section>

        <aside className="inspector-stack" aria-label="Designer workflow panels">
          <section className="panel change-panel">
            <h2>
              <Sparkles size={17} aria-hidden="true" />
              AI Change Review
            </h2>

            {latestCommand ? (
              <div className="change-review">
                <div className={`result-banner ${latestCommand.result.status}`}>
                  {statusIcon(latestCommand.result.status)}
                  <span>{commandStatusLabel(latestCommand.result.status)}</span>
                </div>
                <dl>
                  <div>
                    <dt>Heard</dt>
                    <dd>{latestCommand.rawInput}</dd>
                  </div>
                  <div>
                    <dt>Intent</dt>
                    <dd>{valueText(latestCommand.result.interpretation.command_intent)}</dd>
                  </div>
                  <div>
                    <dt>Confidence</dt>
                    <dd>{confidenceText(latestCommand.result.interpretation.confidence)}</dd>
                  </div>
                  <div>
                    <dt>Result</dt>
                    <dd>
                      {execution?.status === "accepted"
                        ? execution.batch_summary
                        : execution?.status === "needs_clarification"
                          ? execution.question
                          : execution?.status === "rejected"
                            ? execution.message
                            : execution?.status === "no_op"
                              ? execution.message
                              : "Ready"}
                    </dd>
                  </div>
                </dl>
                {operationList.length > 0 ? (
                  <ul className="operation-list" aria-label="Interpreted operations">
                    {operationList.map((operation) => (
                      <li key={operation.operation_id}>
                        <span>{valueText(operation.type)}</span>
                        <strong>{operation.target}</strong>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <div className="quiet-state">No command applied yet.</div>
            )}
          </section>

          <section className="panel voice-panel">
            <h2>
              <Mic size={17} aria-hidden="true" />
              Voice
            </h2>
            <div className="voice-status-row">
              <span className={`voice-state ${voiceSnapshot.state}`}>{valueText(voiceSnapshot.state)}</span>
              <span>{voiceSnapshot.events.length} events</span>
            </div>
            <div className="transcript-stack">
              <div className="transcript-box">
                <span>Partial</span>
                <strong>{voiceSnapshot.partialTranscript || "Empty"}</strong>
              </div>
              <div className="transcript-box final">
                <span>Final</span>
                <strong>{voiceSnapshot.finalTranscript || "Empty"}</strong>
              </div>
            </div>
            {voiceSnapshot.lastError ? <div className="voice-error">{voiceSnapshot.lastError}</div> : null}
            <div className="voice-actions">
              <button type="button" onClick={simulateTranscript}>
                <Sparkles size={15} aria-hidden="true" />
                <span>Sample</span>
              </button>
              <button type="button" className="primary-action" onClick={applyVoiceTranscript} disabled={!voiceSnapshot.finalTranscript}>
                <Send size={15} aria-hidden="true" />
                <span>Apply transcript</span>
              </button>
              <button type="button" onClick={cancelVoiceTranscript} disabled={!voiceSnapshot.partialTranscript && !voiceSnapshot.finalTranscript}>
                <MicOff size={15} aria-hidden="true" />
                <span>Cancel</span>
              </button>
            </div>
            {voiceSnapshot.events.length > 0 ? (
              <ul className="voice-event-list" aria-label="Voice event history">
                {voiceSnapshot.events.slice(0, 4).map((event) => (
                  <li key={event.event_id}>
                    <span>{valueText(event.type)}</span>
                    <strong>{event.final_transcript ?? event.partial_transcript ?? event.message ?? event.created_at}</strong>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="panel">
            <h2>
              <PanelRight size={17} aria-hidden="true" />
              Spec Inspector
            </h2>
            <div className="field-list">
              {fieldRows.map((row) => (
                <button
                  type="button"
                  className="field-row"
                  key={row.path}
                  title={row.path}
                  onClick={() => setCommandInput(`Change ${row.label.toLowerCase()} to `)}
                >
                  <span>
                    <strong>{row.label}</strong>
                    <small>{row.path}</small>
                  </span>
                  <span className="field-value">
                    {row.value}
                    <span className={`status-badge ${row.status}`}>{row.status}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel split-panel">
            <div>
              <h2>
                <History size={17} aria-hidden="true" />
                Versions
              </h2>
              <div className="version-list">
                {[...versionHistory].reverse().map((version) => (
                  <button
                    type="button"
                    className={`version-row ${version.version_id === selectedVersion.version_id ? "selected" : ""}`}
                    key={version.version_id}
                    onClick={() => setSelectedVersionId(version.version_id)}
                  >
                    <span>V{version.version_number}</span>
                    <strong>{version.change_summary}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2>
                <LockKeyhole size={17} aria-hidden="true" />
                Locked Fields
              </h2>
              {selectedVersion.locked_fields.length > 0 ? (
                <ul className="lock-list">
                  {selectedVersion.locked_fields.map((field) => (
                    <li key={field.lock_id}>
                      <strong>{field.field_path}</strong>
                      <span>{field.reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="quiet-state">No locked fields.</div>
              )}
            </div>
          </section>

          <section className="panel system-panel">
            <h2>
              <ShieldCheck size={17} aria-hidden="true" />
              System
            </h2>
            <dl>
              <div>
                <dt>Preload API</dt>
                <dd>{responseLabel(health)}</dd>
              </div>
              <div>
                <dt>Shell</dt>
                <dd>{shellStatus === "ready" ? "Ready" : shellStatus}</dd>
              </div>
              <div>
                <dt>Current Version</dt>
                <dd>V{currentVersion.version_number}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </section>
    </main>
  );
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
