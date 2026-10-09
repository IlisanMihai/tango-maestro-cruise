import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index.tsx";
import EventOradea from "./pages/EventOradea.tsx";
import NotFound from "./pages/NotFound.tsx";

// Dev-only Supabase read check; the DEV guard keeps it out of production bundles.
const DevSupabaseCheck = import.meta.env.DEV ? lazy(() => import("./pages/DevSupabaseCheck.tsx")) : null;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/event" element={<EventOradea />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
