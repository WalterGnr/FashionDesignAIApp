import { createRoot } from "react-dom/client";
import { ExternalLink, MonitorCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { createInitialDesignVersion } from "@fashion-design-ai/domain";
import { useEffect, useMemo, useState } from "react";
import type { AppInfo, DesktopResponse, HealthPingResult } from "../../shared/ipc-contracts.js";
import "./styles.css";

type ShellStatus = "checking" | "ready" | "error";

function responseLabel<T>(response: DesktopResponse<T> | null): string {
  if (!response) {
    return "Pending";
  }

  return response.ok ? "Ready" : response.message;
}

function App() {
  const initialVersion = useMemo(() => createInitialDesignVersion(), []);
  const [appInfo, setAppInfo] = useState<DesktopResponse<AppInfo> | null>(null);
  const [health, setHealth] = useState<DesktopResponse<HealthPingResult> | null>(null);
  const [status, setStatus] = useState<ShellStatus>("checking");

  async function refreshHealth() {
    const ping = await window.fashionDesktop.health.ping({ request_id: "renderer-shell" });
    setHealth(ping);
    setStatus(ping.ok ? "ready" : "error");
  }

  useEffect(() => {
    let active = true;

    async function loadDesktopState() {
      const [info, ping] = await Promise.all([window.fashionDesktop.app.getInfo(), window.fashionDesktop.health.ping({ request_id: "startup" })]);
      if (!active) {
        return;
      }

      setAppInfo(info);
      setHealth(ping);
      setStatus(info.ok && ping.ok ? "ready" : "error");
    }

    void loadDesktopState();

    return () => {
      active = false;
    };
  }, []);

  async function openProjectDocs() {
    await window.fashionDesktop.shell.openExternal({
      url: "https://github.com/WalterGnr/FashionDesignAIApp"
    });
  }

  return (
    <main className="workspace-shell">
      <header className="top-bar">
        <section className="brand-block" aria-label="Current app">
          <span className="brand-mark">FD</span>
          <div>
            <h1>Fashion Design AI</h1>
            <p>Desktop shell</p>
          </div>
        </section>

        <section className="top-actions" aria-label="Shell actions">
          <span className={`status-pill ${status}`}>
            <MonitorCheck size={16} aria-hidden="true" />
            {status === "checking" ? "Checking" : status === "ready" ? "IPC ready" : "Needs attention"}
          </span>
          <button type="button" title="Refresh shell health" onClick={refreshHealth}>
            <RefreshCw size={16} aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button type="button" title="Open project repository" onClick={openProjectDocs}>
            <ExternalLink size={16} aria-hidden="true" />
            <span>Repo</span>
          </button>
        </section>
      </header>

      <section className="workspace-grid">
        <section className="preview-plane" aria-label="Design preview workspace">
          <div className="preview-stage">
            <div className="dress-form" aria-hidden="true">
              <span className="neckline" />
              <span className="bodice" />
              <span className="skirt" />
            </div>
          </div>
          <footer className="preview-footer">
            <span>Version {initialVersion.version_number}</span>
            <span>{initialVersion.spec_snapshot.garment_category}</span>
          </footer>
        </section>

        <aside className="inspector-stack" aria-label="Desktop shell details">
          <section className="panel">
            <h2>
              <ShieldCheck size={17} aria-hidden="true" />
              Process Boundary
            </h2>
            <dl>
              <div>
                <dt>Renderer</dt>
                <dd>unprivileged</dd>
              </div>
              <div>
                <dt>Preload API</dt>
                <dd>{responseLabel(health)}</dd>
              </div>
              <div>
                <dt>Node in UI</dt>
                <dd>blocked</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <h2>App Info</h2>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{appInfo?.ok ? appInfo.data.app_name : "Fashion Design AI"}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{appInfo?.ok ? appInfo.data.app_version : "0.1.0"}</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>{appInfo?.ok ? appInfo.data.environment : "checking"}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <h2>Domain Snapshot</h2>
            <dl>
              <div>
                <dt>Design</dt>
                <dd>{initialVersion.design_id}</dd>
              </div>
              <div>
                <dt>Spec</dt>
                <dd>{initialVersion.spec_snapshot.schema_version}</dd>
              </div>
              <div>
                <dt>Locked</dt>
                <dd>{initialVersion.locked_fields.length}</dd>
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
