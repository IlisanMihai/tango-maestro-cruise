import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/i18n";
import { useEventsSync } from "@/lib/eventsSync";
import LanguageLayout from "@/i18n/LanguageLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Dev-only Supabase read check; the DEV guard keeps it out of production bundles.
const DevSupabaseCheck = import.meta.env.DEV ? lazy(() => import("./pages/DevSupabaseCheck.tsx")) : null;

// Loaded on demand, so the homepage stays light.
const EventsPage = lazy(() => import("./pages/EventsPage.tsx"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage.tsx"));
// Admin area: Romanian only, no language prefix, loaded only when visited.
const AdminShell = lazy(() => import("./admin/AdminShell.tsx"));
const StaffArea = lazy(() => import("./admin/StaffArea.tsx"));
const AdminLogin = lazy(() => import("./admin/pages/LoginPage.tsx"));
const AdminEvents = lazy(() => import("./admin/pages/EventsListPage.tsx"));
const AdminEventForm = lazy(() => import("./admin/pages/EventFormPage.tsx"));
const AdminUsers = lazy(() => import("./admin/pages/UsersPage.tsx"));
const AdminSetPassword = lazy(() => import("./admin/pages/SetPasswordPage.tsx"));
const AdminAccount = lazy(() => import("./admin/pages/AccountPage.tsx"));

// Events are always re-read when a page opens or the tab gets focus again,
// so changes made in the admin show up right away.
const queryClient = new QueryClient();

const EventsSync = () => {
  useEventsSync(queryClient);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EventsSync />
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
          {/* Declared here (not as "/admin/*") so "/admin/events/..." outranks "/:lng/events/:slug". */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={null}>
                <AdminShell />
              </Suspense>
            }
          >
            <Route path="login" element={<AdminLogin />} />
            {/* Opened from invitation / password-reset emails: signs in from the link itself. */}
            <Route path="set-password" element={<AdminSetPassword />} />
            <Route element={<StaffArea />}>
              <Route index element={<AdminEvents />} />
              <Route path="events/new" element={<AdminEventForm key="new" />} />
              <Route path="events/:id" element={<AdminEventForm key="edit" />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="account" element={<AdminAccount />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Romanian at "/", other languages under "/en", "/hu", "/es", "/sk". */}
          <Route path="/:lng?" element={<LanguageLayout />}>
            <Route index element={<Index />} />
            <Route
              path="events"
              element={
                <Suspense fallback={null}>
                  <EventsPage />
                </Suspense>
              }
            />
            <Route
              path="events/:slug"
              element={
                <Suspense fallback={null}>
                  <EventDetailPage />
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
