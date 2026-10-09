import { describe, expect, it, vi, beforeEach } from "vitest";

// A fake Supabase query builder that records the calls and returns `rows`.
const calls: [string, ...unknown[]][] = [];
let rows: unknown[] = [];
const builder: Record<string, unknown> = {};
for (const method of ["select", "eq", "in", "gte", "lt", "order", "limit", "range"]) {
  builder[method] = (...args: unknown[]) => {
    calls.push([method, ...args]);
    return builder;
  };
}
builder.maybeSingle = () => Promise.resolve({ data: rows[0] ?? null, error: null });
builder.then = (resolve: (v: unknown) => unknown) => resolve({ data: rows, error: null });

vi.mock("@/lib/supabase", () => ({ supabase: { from: () => builder } }));

const { fetchActiveEvents, fetchPastEvents, fetchEventBySlug, PAST_PAGE_SIZE } = await import("./events");

const now = new Date("2026-10-10T12:00:00Z");

beforeEach(() => {
  calls.length = 0;
  rows = [];
});

describe("fetchActiveEvents", () => {
  it("asks for published events that have not ended, by start date", async () => {
    await fetchActiveEvents({ now });
    expect(calls).toContainEqual(["eq", "status", "published"]);
    expect(calls).toContainEqual(["gte", "end_at", now.toISOString()]);
    expect(calls).toContainEqual(["order", "start_at", { ascending: true }]);
    expect(calls.some(([, col]) => col === "type")).toBe(false);
  });

  it("filters by one or more types", async () => {
    await fetchActiveEvents({ types: ["milonga", "practica"], now });
    expect(calls).toContainEqual(["in", "type", ["milonga", "practica"]]);
  });

  it("treats an empty selection as all types", async () => {
    await fetchActiveEvents({ types: [], now });
    expect(calls.some(([, col]) => col === "type")).toBe(false);
  });
});

describe("fetchPastEvents", () => {
  it("returns ended events, newest first, one page at a time", async () => {
    rows = Array.from({ length: PAST_PAGE_SIZE + 1 }, (_, i) => ({ id: String(i) }));
    const first = await fetchPastEvents({ page: 0, now });
    expect(calls).toContainEqual(["lt", "end_at", now.toISOString()]);
    expect(calls).toContainEqual(["order", "end_at", { ascending: false }]);
    expect(calls).toContainEqual(["range", 0, PAST_PAGE_SIZE]);
    expect(first.events).toHaveLength(PAST_PAGE_SIZE);
    expect(first.hasMore).toBe(true);

    calls.length = 0;
    rows = [{ id: "last" }];
    const second = await fetchPastEvents({ page: 1, now });
    expect(calls).toContainEqual(["range", PAST_PAGE_SIZE, 2 * PAST_PAGE_SIZE]);
    expect(second.hasMore).toBe(false);
  });
});

describe("fetchEventBySlug", () => {
  it("returns null for a missing (or draft) event", async () => {
    expect(await fetchEventBySlug("nope")).toBeNull();
    expect(calls).toContainEqual(["eq", "slug", "nope"]);
    expect(calls).toContainEqual(["eq", "status", "published"]);
  });
});
