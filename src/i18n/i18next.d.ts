import "i18next";
import type roCommon from "@/locales/ro/common.json";
import type roLegacy from "@/locales/ro/legacy.json";

// Romanian is the reference language: a key missing here is a TypeScript error.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    keySeparator: false;
    resources: {
      common: typeof roCommon;
      legacy: typeof roLegacy;
    };
  }
}
