import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

export function ProtectedRoute({ allowedRoles, children }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p>Checking session...</p>
        </section>
      </main>
    )
  }

  if (!auth.isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Access denied</p>
          <h1>Protected route</h1>
          <p>Your account role cannot access this route.</p>
        </section>
      </main>
    )
  }

  return children
}
