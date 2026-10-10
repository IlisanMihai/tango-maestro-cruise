import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RequireStaff } from "./AdminLayout";
import { useAuth } from "./auth";

/**
 * Layout route: every page below it requires an active staff account.
 * The account is re-checked on every navigation, so a deactivated person is
 * stopped at their next click (the database already refuses their changes).
 */
const StaffArea = () => {
  const { refreshProfile } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => {
    refreshProfile();
  }, [pathname, refreshProfile]);

  return (
    <RequireStaff>
      <Outlet />
    </RequireStaff>
  );
};

export default StaffArea;
