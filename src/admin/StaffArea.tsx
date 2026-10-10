import { Outlet } from "react-router-dom";
import { RequireStaff } from "./AdminLayout";

/** Layout route: every page below it requires an active staff account. */
const StaffArea = () => (
  <RequireStaff>
    <Outlet />
  </RequireStaff>
);

export default StaffArea;
