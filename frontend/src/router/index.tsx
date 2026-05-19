import { createBrowserRouter } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { UnauthorizedPage } from "../components/shared/UnauthorizedPage";

export const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <UnauthorizedPage />, // Safeguard catch-all
  },
]);
