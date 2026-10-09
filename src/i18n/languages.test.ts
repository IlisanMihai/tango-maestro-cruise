import { describe, expect, it } from "vitest";
import { localizePath, splitLanguagePath } from "./languages";

describe("splitLanguagePath", () => {
  it("treats unprefixed paths as Romanian", () => {
    expect(splitLanguagePath("/")).toEqual({ language: "ro", path: "/" });
    expect(splitLanguagePath("/events")).toEqual({ language: "ro", path: "/events" });
  });

  it("reads the language prefix", () => {
    expect(splitLanguagePath("/en")).toEqual({ language: "en", path: "/" });
    expect(splitLanguagePath("/hu/events/milonga-1")).toEqual({ language: "hu", path: "/events/milonga-1" });
  });

  it("does not treat unknown or Romanian prefixes as languages", () => {
    expect(splitLanguagePath("/de/events")).toEqual({ language: "ro", path: "/de/events" });
    expect(splitLanguagePath("/ro/events")).toEqual({ language: "ro", path: "/ro/events" });
  });
});

describe("localizePath", () => {
  it("keeps Romanian unprefixed", () => {
    expect(localizePath("/", "ro")).toBe("/");
    expect(localizePath("/events", "ro")).toBe("/events");
  });

  it("prefixes other languages", () => {
    expect(localizePath("/", "en")).toBe("/en");
    expect(localizePath("/events", "sk")).toBe("/sk/events");
    expect(localizePath("events", "es")).toBe("/es/events");
  });

  it("round-trips with splitLanguagePath", () => {
    for (const language of ["ro", "en", "hu", "es", "sk"] as const) {
      expect(splitLanguagePath(localizePath("/events/x", language))).toEqual({ language, path: "/events/x" });
    }
  });
});
