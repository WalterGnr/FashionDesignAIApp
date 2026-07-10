import type { RenderJob, RenderStatus } from "../../shared/ipc-contracts.js";

export function isActiveRenderStatus(status: RenderStatus): boolean {
  return ["queued", "running", "retrying", "cancel_requested"].includes(status);
}

export function renderStatusLabel(status: RenderStatus): string {
  const labels: Record<RenderStatus, string> = {
    queued: "Queued",
    running: "Rendering",
    retrying: "Retrying",
    cancel_requested: "Canceling",
    canceled: "Canceled",
    succeeded: "Ready",
    failed: "Failed"
  };
  return labels[status];
}

export function mergeRenderJobs(current: RenderJob[], incoming: RenderJob[]): RenderJob[] {
  const jobs = new Map(current.map((job) => [job.id, job]));
  for (const job of incoming) {
    jobs.set(job.id, job);
  }
  return [...jobs.values()].sort((left, right) => {
    const createdComparison = left.created_at.localeCompare(right.created_at);
    return createdComparison !== 0 ? createdComparison : left.variation_index - right.variation_index;
  });
}
