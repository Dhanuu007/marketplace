import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAdminAccess } from './authApi.js'
import { useAuth } from './useAuth.js'
import './auth.css'

export function AdminCheckPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [result, setResult] = useState({
    status: 'loading',
    data: null,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    async function loadAdminCheck() {
      try {
        const data = await checkAdminAccess(auth.token)

        if (!isMounted) return

        setResult({
          status: 'ready',
          data,
          error: null,
        })

        // Admin check successful → go to dashboard
        navigate('/admin/dashboard', { replace: true })
      } catch (error) {
        if (isMounted) {
          setResult({
            status: 'error',
            data: null,
            error: error.message,
          })
        }
      }
    }

    loadAdminCheck()

    return () => {
      isMounted = false
    }
  }, [auth.token, navigate])

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Protected</p>
        <h1>Checking admin access...</h1>

        {result.status === 'loading' && (
          <p>Checking access...</p>
        )}

        {result.status === 'error' && (
          <p className="form-error">{result.error}</p>
        )}
      </section>
    </main>
  )
}