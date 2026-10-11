import { describe, expect, it } from "vitest";
import { resources } from "@/i18n";
import { LANGUAGES } from "@/i18n/languages";

const placeholders = (text: string) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();

import roAdmin from "./ro/admin.json";
import enAdmin from "./en/admin.json";

// Plural forms differ per language (Romanian has "few", English does not).
const withoutPlurals = (keys: string[]) => [...new Set(keys.map((k) => k.replace(/_(zero|one|two|few|many|other)$/, "")))].sort();

describe("admin translation files (Romanian and English)", () => {
  it("en/admin.json has the same texts as ro/admin.json, all filled in", () => {
    expect(withoutPlurals(Object.keys(enAdmin))).toEqual(withoutPlurals(Object.keys(roAdmin)));
    const ro: Record<string, string> = roAdmin;
    for (const [key, value] of Object.entries(enAdmin as Record<string, string>)) {
      expect(value.trim(), `en:${key}`).not.toBe("");
      const reference = ro[key] ?? ro[`${key.replace(/_(one|other)$/, "")}_other`] ?? "";
      expect(placeholders(value), `en:${key}`).toEqual(placeholders(reference));
    }
  });
});

describe("translation files", () => {
  for (const ns of ["common", "legacy"] as const) {
    const reference: Record<string, string> = resources.ro[ns];

    for (const language of LANGUAGES) {
      it(`${language}/${ns}.json has exactly the Romanian keys, all filled in`, () => {
        const translated: Record<string, string> = resources[language][ns];
        expect(Object.keys(translated).sort()).toEqual(Object.keys(reference).sort());
        for (const [key, value] of Object.entries(translated)) {
          expect(value.trim(), `${language}:${key}`).not.toBe("");
          expect(placeholders(value), `${language}:${key}`).toEqual(placeholders(reference[key]));
        }
      });
    }
  }
});
