import type { PreviewParameters } from "./preview-parameters.js";
import type { CSSProperties } from "react";

export function PreviewFallback({ parameters }: { parameters: PreviewParameters }) {
  return (
    <div className="preview-fallback" role="img" aria-label={`${parameters.labels.color} ${parameters.labels.silhouette} dress preview`}>
      <div className="fallback-figure" style={{ "--fallback-dress-color": parameters.material.color } as CSSProperties}>
        <span className="fallback-head" />
        <span className="fallback-bodice" />
        <span className={`fallback-skirt ${parameters.skirtShape}`} />
      </div>
      <span>2D preview</span>
    </div>
  );
}
