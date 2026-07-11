import type { DesignVersion } from "@fashion-design-ai/domain";
import type { FashionDesktopApi } from "../../shared/ipc-contracts.js";

export type PersistedDesignVersion = {
  designId: string;
  versionId: string;
};

export class BackendDesignSession {
  private designId: string | null = null;
  private versionIds: Record<string, string> = {};
  private pending = new Map<string, Promise<PersistedDesignVersion>>();

  ensurePersistedVersion(
    version: DesignVersion,
    desktopApi?: FashionDesktopApi
  ): Promise<PersistedDesignVersion> {
    if (!desktopApi) {
      return Promise.reject(new Error("This workflow is available in the desktop application."));
    }
    const existingVersionId = this.versionIds[version.version_id];
    if (this.designId && existingVersionId) {
      return Promise.resolve({ designId: this.designId, versionId: existingVersionId });
    }
    const activeRequest = this.pending.get(version.version_id);
    if (activeRequest) {
      return activeRequest;
    }

    const request = this.persist(version, desktopApi).finally(() => {
      this.pending.delete(version.version_id);
    });
    this.pending.set(version.version_id, request);
    return request;
  }

  private async persist(version: DesignVersion, desktopApi: FashionDesktopApi): Promise<PersistedDesignVersion> {
    const parentBackendVersionId = version.parent_version_id
      ? this.versionIds[version.parent_version_id]
      : undefined;
    const response = await desktopApi.backend.syncDesignVersion({
      ...(this.designId ? { backend_design_id: this.designId } : {}),
      design_name: "Untitled Dress Study",
      local_version_id: version.version_id,
      ...(parentBackendVersionId ? { parent_backend_version_id: parentBackendVersionId } : {}),
      source: version.created_from,
      change_summary: version.change_summary,
      spec_snapshot: version.spec_snapshot,
      locked_fields_snapshot: version.locked_fields.map((field) => ({ ...field })),
      operation_ids: version.operation_ids
    });
    if (!response.ok) {
      throw new Error(response.message);
    }
    this.designId = response.data.design_id;
    this.versionIds[version.version_id] = response.data.design_version_id;
    return { designId: response.data.design_id, versionId: response.data.design_version_id };
  }
}
