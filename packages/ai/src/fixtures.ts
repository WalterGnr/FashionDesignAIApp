import { createInitialDesignVersion, createMinimalDressSpec, specValue, type DesignVersion } from "@fashion-design-ai/domain";

export function createConfirmedRedDressVersion(): DesignVersion {
  return createInitialDesignVersion(
    createMinimalDressSpec({
      color: {
        ...createMinimalDressSpec().color,
        primary_color: {
          name: specValue("red", "confirmed", "user")
        }
      }
    })
  );
}

export function createLockedNecklineVersion(): DesignVersion {
  const version = createInitialDesignVersion(
    createMinimalDressSpec({
      neckline: {
        type: specValue("off_shoulder", "confirmed", "user"),
        depth: specValue("unknown", "unknown", null)
      }
    })
  );

  return {
    ...version,
    locked_fields: [
      {
        lock_id: "lock-neckline",
        field_path: "neckline",
        reason: "Designer approved neckline.",
        locked_by: "user",
        locked_from: "ui",
        created_at: "2026-07-08T00:00:00.000Z"
      }
    ]
  };
}

export function createAmbiguousTrimVersion(): DesignVersion {
  return createInitialDesignVersion({
    ...createMinimalDressSpec(),
    embellishments: [
      {
        id: "embellishment-pearl-neckline",
        type: "pearls",
        placement: "neckline",
        density: "moderate",
        status: "confirmed",
        notes: "Pearl trim at neckline."
      },
      {
        id: "embellishment-lace-hem",
        type: "lace_trim",
        placement: "hem",
        density: "moderate",
        status: "confirmed",
        notes: "Lace trim at hem."
      }
    ]
  });
}
