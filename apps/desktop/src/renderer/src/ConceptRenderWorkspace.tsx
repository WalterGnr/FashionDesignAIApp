import { AlertTriangle, ImagePlus, LoaderCircle, Sparkles, X } from "lucide-react";
import type { DesignVersion } from "@fashion-design-ai/domain";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FashionDesktopApi,
  RenderJob,
  RenderStatus
} from "../../shared/ipc-contracts.js";
import { isActiveRenderStatus, mergeRenderJobs, renderStatusLabel } from "./render-session.js";
import type { PersistedDesignVersion } from "./backend-design-session.js";

type ConceptRenderWorkspaceProps = {
  selectedVersion: DesignVersion;
  desktopApi?: FashionDesktopApi;
  ensurePersistedVersion: (version: DesignVersion) => Promise<PersistedDesignVersion>;
};

type RenderStyle = "editorial_studio" | "technical_studio";
type RenderView = "front" | "three_quarter" | "side" | "back";
type RenderQuality = "low" | "medium" | "high";

function statusIcon(status: RenderStatus) {
  if (status === "failed") {
    return <AlertTriangle size={15} aria-hidden="true" />;
  }
  if (isActiveRenderStatus(status)) {
    return <LoaderCircle className="spin" size={15} aria-hidden="true" />;
  }
  return <Sparkles size={15} aria-hidden="true" />;
}

export function ConceptRenderWorkspace({
  selectedVersion,
  desktopApi,
  ensurePersistedVersion
}: ConceptRenderWorkspaceProps) {
  const [renderStyle, setRenderStyle] = useState<RenderStyle>("editorial_studio");
  const [renderView, setRenderView] = useState<RenderView>("three_quarter");
  const [quality, setQuality] = useState<RenderQuality>("medium");
  const [variationCount, setVariationCount] = useState(1);
  const [requesting, setRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncedVersionIds, setSyncedVersionIds] = useState<Set<string>>(() => new Set());
  const [jobsByVersion, setJobsByVersion] = useState<Record<string, RenderJob[]>>({});
  const [assetDataUrls, setAssetDataUrls] = useState<Record<string, string>>({});
  const loadingAssetsRef = useRef(new Set<string>());

  const selectedJobs = useMemo(
    () => jobsByVersion[selectedVersion.version_id] ?? [],
    [jobsByVersion, selectedVersion.version_id]
  );

  function updateSelectedJobs(incoming: RenderJob[]) {
    setJobsByVersion((current) => ({
      ...current,
      [selectedVersion.version_id]: mergeRenderJobs(current[selectedVersion.version_id] ?? [], incoming)
    }));
  }

  async function requestRenders() {
    setRequesting(true);
    setErrorMessage(null);
    try {
      const persisted = await ensurePersistedVersion(selectedVersion);
      setSyncedVersionIds((current) => new Set(current).add(selectedVersion.version_id));
      if (!desktopApi) {
        throw new Error("Concept rendering is available in the desktop application.");
      }
      const response = await desktopApi.renders.create({
        design_id: persisted.designId,
        design_version_id: persisted.versionId,
        render_style: renderStyle,
        view_preset: renderView,
        quality,
        output_size: "1024x1536",
        variation_count: variationCount,
        client_idempotency_key: `${selectedVersion.version_id}-${renderStyle}-${renderView}-${quality}-${variationCount}`.slice(0, 120)
      });
      if (!response.ok) {
        throw new Error(response.message);
      }
      updateSelectedJobs(response.data.jobs);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The render request could not be started.");
    } finally {
      setRequesting(false);
    }
  }

  async function cancelRender(job: RenderJob) {
    if (!desktopApi) {
      return;
    }
    const response = await desktopApi.renders.cancel({ render_job_id: job.id });
    if (response.ok) {
      updateSelectedJobs([response.data]);
    } else {
      setErrorMessage(response.message);
    }
  }

  useEffect(() => {
    if (!desktopApi) {
      return;
    }
    const api = desktopApi;
    const activeJobs = selectedJobs.filter((job) => isActiveRenderStatus(job.status));
    if (activeJobs.length === 0) {
      return;
    }
    let active = true;
    async function poll() {
      const responses = await Promise.all(
        activeJobs.map((job) => api.renders.get({ render_job_id: job.id }))
      );
      if (!active) {
        return;
      }
      const jobs = responses.flatMap((response) => (response.ok ? [response.data] : []));
      if (jobs.length > 0) {
        updateSelectedJobs(jobs);
      }
    }
    void poll();
    const timer = window.setInterval(() => void poll(), 1_500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [desktopApi, selectedJobs]);

  useEffect(() => {
    if (!desktopApi) {
      return;
    }
    for (const job of selectedJobs) {
      const assetId = job.asset?.id;
      if (!assetId || assetDataUrls[assetId] || loadingAssetsRef.current.has(assetId)) {
        continue;
      }
      loadingAssetsRef.current.add(assetId);
      void desktopApi.renders.getAssetDataUrl({ asset_id: assetId }).then((response) => {
        loadingAssetsRef.current.delete(assetId);
        if (response.ok) {
          setAssetDataUrls((current) => ({ ...current, [assetId]: response.data.data_url }));
        } else {
          setErrorMessage(response.message);
        }
      });
    }
  }, [assetDataUrls, desktopApi, selectedJobs]);

  return (
    <section className="concept-render-workspace" aria-label="Concept render workspace">
      <div className="concept-controls">
        <label>
          <span>Style</span>
          <select value={renderStyle} onChange={(event) => setRenderStyle(event.target.value as RenderStyle)}>
            <option value="editorial_studio">Editorial</option>
            <option value="technical_studio">Technical</option>
          </select>
        </label>
        <label>
          <span>View</span>
          <select value={renderView} onChange={(event) => setRenderView(event.target.value as RenderView)}>
            <option value="front">Front</option>
            <option value="three_quarter">3/4</option>
            <option value="side">Side</option>
            <option value="back">Back</option>
          </select>
        </label>
        <label>
          <span>Quality</span>
          <select value={quality} onChange={(event) => setQuality(event.target.value as RenderQuality)}>
            <option value="low">Draft</option>
            <option value="medium">Standard</option>
            <option value="high">High</option>
          </select>
        </label>
        <div className="variation-control" aria-label="Variation count">
          <span>Variations</span>
          <div className="segmented-control">
            {[1, 2, 4].map((count) => (
              <button
                key={count}
                type="button"
                className={variationCount === count ? "selected" : ""}
                aria-pressed={variationCount === count}
                onClick={() => setVariationCount(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="generate-render-action" onClick={requestRenders} disabled={requesting || !desktopApi}>
          {requesting ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
          <span>{requesting ? "Queueing" : "Generate"}</span>
        </button>
      </div>

      {errorMessage ? (
        <div className="concept-error" role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {selectedJobs.length === 0 ? (
        <div className="concept-empty-state">
          <Sparkles size={26} aria-hidden="true" />
          <strong>No concept renders for Version {selectedVersion.version_number}</strong>
          <span>{desktopApi ? "Ready for a background render." : "Open the desktop app to generate."}</span>
        </div>
      ) : (
        <div className={`concept-render-grid count-${Math.min(selectedJobs.length, 4)}`}>
          {selectedJobs.map((job) => {
            const imageUrl = job.asset ? assetDataUrls[job.asset.id] : undefined;
            return (
              <article className={`concept-render-card ${job.status}`} key={job.id}>
                <div className="concept-image-frame">
                  {imageUrl ? (
                    <img src={imageUrl} alt={`Dress concept variation ${job.variation_index}`} />
                  ) : (
                    <div className="concept-job-state">
                      {statusIcon(job.status)}
                      <strong>{renderStatusLabel(job.status)}</strong>
                      <span>{job.safe_error_message ?? `Variation ${job.variation_index}`}</span>
                    </div>
                  )}
                  <span className="concept-only-badge">Concept only</span>
                  {isActiveRenderStatus(job.status) ? (
                    <button type="button" className="cancel-render" title="Cancel render" onClick={() => cancelRender(job)}>
                      <X size={15} aria-hidden="true" />
                      <span className="sr-only">Cancel render</span>
                    </button>
                  ) : null}
                </div>
                <footer>
                  <span>Variation {job.variation_index}</span>
                  <span>{job.provider === "mock" ? "Development provider" : job.provider_model}</span>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {selectedJobs.map((job) => `Variation ${job.variation_index}: ${renderStatusLabel(job.status)}`).join(". ")}
      </span>
      <span className="concept-version-trace">
        Version {selectedVersion.version_number} {syncedVersionIds.has(selectedVersion.version_id) ? "synced" : "local"}
      </span>
    </section>
  );
}
