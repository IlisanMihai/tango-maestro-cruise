import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./auth";
import { FullPageSpinner } from "./AdminLayout";
import { applyAdminLanguage } from "./i18n";

/** Root of /admin (a separate chunk, so visitors never download admin code). */
const AdminShell = () => {
  // Before the first render: the admin opens directly in its saved language.
  useState(applyAdminLanguage);
  return (
    <AuthProvider>
      <Suspense fallback={<FullPageSpinner />}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  );
};

export default AdminShell;
