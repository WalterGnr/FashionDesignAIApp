import { createInitialDesignVersion } from "@fashion-design-ai/domain";
import { describe, expect, it, vi } from "vitest";
import { BackendDesignSession } from "../src/renderer/src/backend-design-session.js";
import type { FashionDesktopApi } from "../src/shared/ipc-contracts.js";

describe("BackendDesignSession", () => {
  it("coalesces concurrent persistence requests and reuses the backend version", async () => {
    const version = createInitialDesignVersion();
    const syncDesignVersion = vi.fn().mockResolvedValue({
      ok: true,
      data: {
        design_id: "2cf99895-c76a-41ad-85cb-3954c8e600a7",
        design_version_id: "02962452-9f80-41a2-9d39-a832f36ee71d"
      }
    });
    const desktopApi = { backend: { syncDesignVersion } } as unknown as FashionDesktopApi;
    const session = new BackendDesignSession();

    const [first, second] = await Promise.all([
      session.ensurePersistedVersion(version, desktopApi),
      session.ensurePersistedVersion(version, desktopApi)
    ]);
    const third = await session.ensurePersistedVersion(version, desktopApi);

    expect(first).toEqual(second);
    expect(third).toEqual(first);
    expect(syncDesignVersion).toHaveBeenCalledTimes(1);
  });
});
