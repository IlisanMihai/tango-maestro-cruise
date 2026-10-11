import "i18next";
import type roCommon from "@/locales/ro/common.json";
import type roLegacy from "@/locales/ro/legacy.json";
import type roAdmin from "@/locales/ro/admin.json";

// Romanian is the reference language: a key missing here is a TypeScript error.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    keySeparator: false;
    resources: {
      common: typeof roCommon;
      legacy: typeof roLegacy;
      // loaded by the admin area only (src/admin/i18n.ts)
      admin: typeof roAdmin;
    };
  }
}
