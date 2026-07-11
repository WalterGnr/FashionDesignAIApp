import type { DesignVersion } from "@fashion-design-ai/domain";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  PackageCheck,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  FashionDesktopApi,
  TechPackFormat,
  TechPackJob,
  TechPackReadiness
} from "../../shared/ipc-contracts.js";
import type { PersistedDesignVersion } from "./backend-design-session.js";

type TechPackExportDialogProps = {
  selectedVersion: DesignVersion;
  desktopApi?: FashionDesktopApi;
  ensurePersistedVersion: (version: DesignVersion) => Promise<PersistedDesignVersion>;
  onClose: () => void;
};

const activeStatuses = new Set(["queued", "running", "retrying", "cancel_requested"]);

function readinessLabel(status: TechPackReadiness["status"]): string {
  if (status === "ready") return "Production ready";
  if (status === "ready_with_warnings") return "Ready with warnings";
  return "Draft only";
}

function jobLabel(job: TechPackJob): string {
  if (job.status === "succeeded") return "Tech pack complete";
  if (job.status === "succeeded_with_partial_formats") return "Partially complete";
  if (job.status === "failed") return "Generation failed";
  if (job.status === "canceled") return "Generation canceled";
  if (job.status === "blocked") return "Draft acknowledgement required";
  if (job.status === "running") return "Building files";
  if (job.status === "retrying") return "Retrying export";
  return "Waiting for export worker";
}

export function TechPackExportDialog({
  selectedVersion,
  desktopApi,
  ensurePersistedVersion,
  onClose
}: TechPackExportDialogProps) {
  const [formats, setFormats] = useState<Set<TechPackFormat>>(() => new Set(["pdf", "xlsx"]));
  const [pageSize, setPageSize] = useState<"letter" | "a4">("letter");
  const [persisted, setPersisted] = useState<PersistedDesignVersion | null>(null);
  const [readiness, setReadiness] = useState<TechPackReadiness | null>(null);
  const [job, setJob] = useState<TechPackJob | null>(null);
  const [acknowledgeDraft, setAcknowledgeDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openingAssetId, setOpeningAssetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedFormats = useMemo(() => [...formats].sort(), [formats]);
  const requiresDraftAcknowledgement = readiness?.status === "blocked";

  useEffect(() => {
    let active = true;
    async function checkReadiness() {
      setLoading(true);
      setErrorMessage(null);
      try {
        if (!desktopApi) throw new Error("Tech-pack export is available in the desktop application.");
        const persistedVersion = await ensurePersistedVersion(selectedVersion);
        const response = await desktopApi.techPacks.readiness({
          design_id: persistedVersion.designId,
          design_version_id: persistedVersion.versionId
        });
        if (!response.ok) throw new Error(response.message);
        if (active) {
          setPersisted(persistedVersion);
          setReadiness(response.data);
        }
      } catch (error) {
        if (active) setErrorMessage(error instanceof Error ? error.message : "Readiness could not be checked.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void checkReadiness();
    return () => {
      active = false;
    };
  }, [desktopApi, ensurePersistedVersion, selectedVersion]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!desktopApi || !job || !activeStatuses.has(job.status)) return;
    let active = true;
    async function poll() {
      const response = await desktopApi!.techPacks.get({ tech_pack_job_id: job!.id });
      if (!active) return;
      if (response.ok) setJob(response.data);
      else setErrorMessage(response.message);
    }
    const timer = window.setInterval(() => void poll(), 1_250);
    void poll();
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [desktopApi, job]);

  function toggleFormat(format: TechPackFormat) {
    setFormats((current) => {
      const next = new Set(current);
      if (next.has(format) && next.size > 1) next.delete(format);
      else next.add(format);
      return next;
    });
  }

  async function generate() {
    if (!desktopApi || !persisted || !readiness) return;
    setGenerating(true);
    setErrorMessage(null);
    try {
      const response = await desktopApi.techPacks.create({
        design_id: persisted.designId,
        design_version_id: persisted.versionId,
        formats: selectedFormats,
        page_size: pageSize,
        locale: "en-US",
        unit_preference: "source",
        acknowledge_draft: acknowledgeDraft,
        client_idempotency_key: `${selectedVersion.version_id}-${pageSize}-${selectedFormats.join("-")}-${acknowledgeDraft}`.slice(
          0,
          120
        )
      });
      if (!response.ok) throw new Error(response.message);
      setJob(response.data.job);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The export could not be started.");
    } finally {
      setGenerating(false);
    }
  }

  async function openAsset(assetId: string, format: TechPackFormat) {
    if (!desktopApi) return;
    setOpeningAssetId(assetId);
    setErrorMessage(null);
    const response = await desktopApi.techPacks.openAsset({ asset_id: assetId, format });
    if (!response.ok) setErrorMessage(response.message);
    setOpeningAssetId(null);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="tech-pack-dialog" role="dialog" aria-modal="true" aria-labelledby="tech-pack-title">
        <header className="tech-pack-dialog-header">
          <div>
            <span className="dialog-eyebrow">Version {selectedVersion.version_number}</span>
            <h2 id="tech-pack-title">Export production tech pack</h2>
          </div>
          <button type="button" className="icon-button" title="Close export" onClick={onClose}>
            <X size={17} aria-hidden="true" />
            <span className="sr-only">Close export</span>
          </button>
        </header>

        <div className="tech-pack-dialog-body">
          {loading ? (
            <div className="export-loading"><LoaderCircle className="spin" size={20} aria-hidden="true" />Checking production readiness</div>
          ) : readiness ? (
            <>
              <div className={`readiness-banner ${readiness.status}`}>
                {readiness.status === "blocked" ? <AlertTriangle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
                <div>
                  <strong>{readinessLabel(readiness.status)}</strong>
                  <span>{readiness.issues.length} production check{readiness.issues.length === 1 ? "" : "s"}</span>
                </div>
              </div>

              <section className="export-options" aria-label="Export settings">
                <div>
                  <h3>Files</h3>
                  <div className="format-selector">
                    <label className={formats.has("pdf") ? "selected" : ""}>
                      <input type="checkbox" checked={formats.has("pdf")} onChange={() => toggleFormat("pdf")} />
                      <FileText size={18} aria-hidden="true" />
                      <span><strong>PDF</strong><small>Review and print</small></span>
                    </label>
                    <label className={formats.has("xlsx") ? "selected" : ""}>
                      <input type="checkbox" checked={formats.has("xlsx")} onChange={() => toggleFormat("xlsx")} />
                      <FileSpreadsheet size={18} aria-hidden="true" />
                      <span><strong>XLSX</strong><small>Production workbook</small></span>
                    </label>
                  </div>
                </div>
                <label className="page-size-control">
                  <span>Page size</span>
                  <select value={pageSize} onChange={(event) => setPageSize(event.target.value as "letter" | "a4")}>
                    <option value="letter">US Letter</option>
                    <option value="a4">A4</option>
                  </select>
                </label>
              </section>

              {readiness.issues.length > 0 ? (
                <section className="readiness-issues">
                  <h3>Production checks</h3>
                  <ul>
                    {readiness.issues.map((issue) => (
                      <li className={issue.severity} key={`${issue.code}-${issue.field_path ?? "general"}`}>
                        <AlertTriangle size={14} aria-hidden="true" />
                        <span><strong>{issue.severity}</strong>{issue.message}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {requiresDraftAcknowledgement ? (
                <label className="draft-acknowledgement">
                  <input type="checkbox" checked={acknowledgeDraft} onChange={(event) => setAcknowledgeDraft(event.target.checked)} />
                  <span><strong>Generate a clearly labeled draft</strong>I understand this pack is incomplete and not approved for production.</span>
                </label>
              ) : null}

              {job ? (
                <section className={`export-job-status ${job.status}`} aria-live="polite">
                  <div>
                    {activeStatuses.has(job.status) ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : <PackageCheck size={17} aria-hidden="true" />}
                    <strong>{jobLabel(job)}</strong>
                  </div>
                  <div className="export-file-results">
                    {job.requested_formats.map((format) => {
                      const asset = job.assets.find((item) => item.format === format);
                      return (
                        <div key={format}>
                          {format === "pdf" ? <FileText size={16} aria-hidden="true" /> : <FileSpreadsheet size={16} aria-hidden="true" />}
                          <span>{format.toUpperCase()}</span>
                          <strong>{job.format_statuses[format]}</strong>
                          {asset ? (
                            <button type="button" onClick={() => openAsset(asset.id, asset.format)} disabled={openingAssetId === asset.id}>
                              {openingAssetId === asset.id ? "Opening" : "Open"}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

          {errorMessage ? <div className="export-error" role="alert"><AlertTriangle size={16} aria-hidden="true" />{errorMessage}</div> : null}
        </div>

        <footer className="tech-pack-dialog-footer">
          <span>Exact dress spec snapshot · Unknown values stay unknown</span>
          <button
            type="button"
            className="primary-action"
            onClick={generate}
            disabled={loading || generating || !readiness || (requiresDraftAcknowledgement && !acknowledgeDraft)}
          >
            {generating ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <PackageCheck size={16} aria-hidden="true" />}
            <span>{generating ? "Starting" : requiresDraftAcknowledgement ? "Generate draft" : "Generate tech pack"}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
