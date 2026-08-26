import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import './auth.css'

export function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
  })
  const [error, setError] = useState('')

  if (auth.isAuthenticated) {
    return <Navigate replace to="/account" />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      await auth.register(form)
      navigate('/account', { replace: true })
    } catch (authError) {
      setError(authError.message)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Authentication</p>
        <h1>Register</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              autoComplete="name"
              name="name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
              type="text"
              value={form.name}
            />
          </label>

          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              name="password"
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
              type="password"
              value={form.password}
            />
          </label>

          <label>
            <span>Role</span>
            <select
              name="role"
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value }))
              }
              value={form.role}
            >
              <option value="BUYER">Buyer</option>
              <option value="CREATOR">Creator</option>
            </select>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit">Register</button>
        </form>

        <Link to="/login">Use an existing account</Link>
      </section>
    </main>
  )
}
