import { describe, expect, it } from "vitest";
import { resources } from "@/i18n";
import { LANGUAGES } from "@/i18n/languages";

const placeholders = (text: string) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();

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
