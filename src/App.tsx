import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/i18n";
import LanguageLayout from "@/i18n/LanguageLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Dev-only Supabase read check; the DEV guard keeps it out of production bundles.
const DevSupabaseCheck = import.meta.env.DEV ? lazy(() => import("./pages/DevSupabaseCheck.tsx")) : null;

// Kept live until /events exists (stage 3), then replaced by a redirect. Loaded on demand.
const EventOradeaPage = lazy(() => import("./templates/carolina/EventOradeaPage.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {DevSupabaseCheck && (
            <Route
              path="/dev/supabase"
              element={
                <Suspense fallback={null}>
                  <DevSupabaseCheck />
                </Suspense>
              }
            />
          )}
          {/* Romanian at "/", other languages under "/en", "/hu", "/es", "/sk". */}
          <Route path="/:lng?" element={<LanguageLayout />}>
            <Route index element={<Index />} />
            <Route
              path="event"
              element={
                <Suspense fallback={null}>
                  <EventOradeaPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
