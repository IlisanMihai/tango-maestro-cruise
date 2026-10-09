import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "@/i18n";
import type { EventRow } from "@/lib/supabase";

const supabaseState = vi.hoisted(() => ({ configured: true }));
const fetchUpcomingEvents = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabaseConfig", () => ({
  get isSupabaseConfigured() {
    return supabaseState.configured;
  },
  supabaseUrl: "https://example.supabase.co",
}));
vi.mock("@/lib/events", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/events")>()),
  fetchUpcomingEvents,
}));

const { default: UpcomingEventsSection } = await import("./UpcomingEventsSection");

const event = (slug: string, title: string): EventRow => ({
  id: slug,
  slug,
  type: "milonga",
  start_at: "2026-11-07T19:00:00Z",
  end_at: "2026-11-08T00:00:00Z",
  title: { ro: title, en: `${title} (EN)` },
  summary: null,
  content: null,
  location: "Oradea",
  image_path: null,
  external_url: null,
  status: "published",
  created_by: null,
  created_at: "",
  updated_at: "",
});

function renderSection() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <UpcomingEventsSection />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("UpcomingEventsSection", () => {
  beforeEach(async () => {
    supabaseState.configured = true;
    fetchUpcomingEvents.mockReset();
    await i18n.changeLanguage("ro");
  });

  it("renders nothing when Supabase is not configured", () => {
    supabaseState.configured = false;
    const { container } = renderSection();
    expect(container).toBeEmptyDOMElement();
    expect(fetchUpcomingEvents).not.toHaveBeenCalled();
  });

  it("renders nothing when the request fails", async () => {
    fetchUpcomingEvents.mockRejectedValue(new Error("network"));
    const { container } = renderSection();
    await vi.waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("shows the events as cards linking to their localized pages", async () => {
    fetchUpcomingEvents.mockResolvedValue([event("a", "Milonga A"), event("b", "Milonga B")]);
    await i18n.changeLanguage("en");
    renderSection();
    expect(await screen.findByText("Milonga A (EN)")).toBeInTheDocument();
    expect(screen.getByText("Milonga B (EN)").closest("a")).toHaveAttribute("href", "/en/events/b");
    expect(fetchUpcomingEvents).toHaveBeenCalledWith(3);
  });

  it("shows a friendly message when nothing is scheduled", async () => {
    fetchUpcomingEvents.mockResolvedValue([]);
    renderSection();
    expect(await screen.findByText(/nu sunt evenimente programate/i)).toBeInTheDocument();
  });
});
