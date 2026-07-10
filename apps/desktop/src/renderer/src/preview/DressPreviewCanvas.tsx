import { Canvas } from "@react-three/fiber";
import { RotateCcw } from "lucide-react";
import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import * as THREE from "three";
import { DressScene, type PreviewView } from "./DressScene.js";
import { PreviewFallback } from "./PreviewFallback.js";
import type { PreviewParameters } from "./preview-parameters.js";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  resetKey: string;
};

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The fallback is intentionally quiet; renderer details remain in development logs.
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const VIEW_LABELS: Array<{ value: PreviewView; label: string }> = [
  { value: "front", label: "Front" },
  { value: "three_quarter", label: "3/4" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" }
];

export function DressPreviewCanvas({ parameters, versionId }: { parameters: PreviewParameters; versionId: string }) {
  const [view, setView] = useState<PreviewView>("three_quarter");
  const [viewRevision, setViewRevision] = useState(0);

  function selectView(next: PreviewView) {
    setView(next);
    setViewRevision((revision) => revision + 1);
  }

  return (
    <div className="dress-preview-canvas-shell" data-testid="dress-preview-shell">
      <PreviewErrorBoundary fallback={<PreviewFallback parameters={parameters} />} resetKey={versionId}>
        <Canvas
          className="dress-preview-canvas"
          data-testid="dress-preview-canvas"
          camera={{ fov: 40, near: 0.1, far: 50, position: [5.45, 1.9, 7.2] }}
          dpr={[1, 1.5]}
          frameloop="demand"
          fallback={<PreviewFallback parameters={parameters} />}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <DressScene parameters={parameters} view={view} viewRevision={viewRevision} />
        </Canvas>
      </PreviewErrorBoundary>

      <div className="preview-mode-badge">
        <span className="preview-live-dot" />
        3D concept
      </div>

      <div className="preview-view-controls" role="group" aria-label="Preview view">
        {VIEW_LABELS.map((option) => (
          <button
            type="button"
            className={view === option.value ? "selected" : ""}
            key={option.value}
            title={`${option.label} view`}
            aria-pressed={view === option.value}
            onClick={() => selectView(option.value)}
          >
            {option.label}
          </button>
        ))}
        <button type="button" className="reset-view" title="Reset preview view" onClick={() => selectView("three_quarter")}>
          <RotateCcw size={14} aria-hidden="true" />
          <span className="sr-only">Reset preview view</span>
        </button>
      </div>

      {parameters.notices.length > 0 ? (
        <span className="preview-assumption" title={parameters.notices.join(" ")}>
          {parameters.notices.length} assumed {parameters.notices.length === 1 ? "field" : "fields"}
        </span>
      ) : null}
    </div>
  );
}
