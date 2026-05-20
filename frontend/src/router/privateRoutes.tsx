import type { RouteObject } from "react-router-dom";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { SuperAdminDashboard } from "../features/super-admin/SuperAdminDashboard";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";

// Import our interactive FitCore feature sub-pages
import { MembersPage } from "../features/members/MembersPage";
import { TrainersPage } from "../features/trainers/TrainersPage";
import { PlansPage } from "../features/plans/PlansPage";
import { PaymentsPage } from "../features/payments/PaymentsPage";
import { AttendancePage } from "../features/attendance/AttendancePage";
import { SettingsPage } from "../features/settings/SettingsPage";

export const privateRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["GYM_OWNER", "GYM_ADMIN", "TRAINER", "MEMBER"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <DashboardPage />,
      },
      {
        path: "members",
        element: <MembersPage />,
      },
      {
        path: "trainers",
        element: <TrainersPage />,
      },
      {
        path: "plans",
        element: <PlansPage />,
      },
      {
        path: "classes",
        element: <AttendancePage />,
      },
      {
        path: "attendance",
        element: <AttendancePage />,
      },
      {
        path: "payments",
        element: <PaymentsPage />,
      },
      {
        path: "reports",
        element: <DashboardPage />, // DashboardPage renders the custom premium overview charts & logs
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "/super-admin",
    element: (
      <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <SuperAdminDashboard />,
      },
      {
        path: "gyms",
        element: <SuperAdminDashboard />,
      },
      {
        path: "settings",
        element: <SuperAdminDashboard />,
      },
    ],
  },
];
