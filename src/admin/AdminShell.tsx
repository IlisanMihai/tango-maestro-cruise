import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./auth";
import { FullPageSpinner } from "./AdminLayout";

/** Root of /admin (a separate chunk, so visitors never download admin code). */
const AdminShell = () => (
  <AuthProvider>
    <Suspense fallback={<FullPageSpinner />}>
      <Outlet />
    </Suspense>
  </AuthProvider>
);

export default AdminShell;
