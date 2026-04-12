import { createBrowserRouter } from "react-router-dom"
import LoginPage from "../../features/auth/pages/LoginPage"
import DashboardPage from "../../features/dashboard/pages/DashboardPage"
import ProtectedRoute from "../../features/auth/components/ProtectedRoute"
import PublicOnlyRoute from "../../features/auth/components/PublicOnlyRoute"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
])