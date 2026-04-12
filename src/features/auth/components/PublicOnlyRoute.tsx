import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { useAuth } from "../context/AuthContext"

type PublicOnlyRouteProps = {
  children: ReactNode
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: 24 }}>Yükleniyor...</div>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}