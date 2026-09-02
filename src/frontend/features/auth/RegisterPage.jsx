import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import './RegisterPage.css'

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
    <main className="register-shell">
      {/* Top navigation */}
      <nav className="register-nav">
        <Link to="/" className="register-home-link">
          <span className="register-home-icon">←</span>
          Dashboard
        </Link>
      </nav>

      {/* Registration card */}
      <section className="register-card">

        {/* Brand panel */}
        <div className="register-brand">
          <div className="register-brand-content">
            <p className="register-brand-label">MARKETPLACE</p>

            <h1 className="register-brand-title">
              <span className="word-buy">Buy.</span>
              <br />
              <span className="word-create">Create.</span>
              <br />
              <span className="word-sell">Sell.</span>
              <br />
              <span className="word-connect">Connect.</span>
            </h1>

            <p className="register-brand-description">
              Join a growing marketplace where buyers discover
              great products and creators build their businesses.
            </p>

            <div className="register-benefits">
              <div className="register-benefit">
                <span>✓</span>
                <p>Discover unique products</p>
              </div>

              <div className="register-benefit">
                <span>✓</span>
                <p>Build your creator profile</p>
              </div>

              <div className="register-benefit">
                <span>✓</span>
                <p>Simple and secure experience</p>
              </div>
            </div>
          </div>

          <div className="register-brand-footer">
            Your marketplace starts here.
          </div>
        </div>

        {/* Form panel */}
        <div className="register-form-panel">
          <div className="register-form-header">
            <p className="register-eyebrow">CREATE ACCOUNT</p>

            <h2>Welcome to Marketplace</h2>

            <p>Create your account to get started.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              <span>Name</span>

              <input
                autoComplete="name"
                name="name"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Enter your name"
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
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="you@example.com"
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
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Create a password"
                required
                type="password"
                value={form.password}
              />

              <small>Use at least 8 characters.</small>
            </label>

            <label>
              <span>Account type</span>

              <select
                name="role"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
                value={form.role}
              >
                <option value="BUYER">Buyer</option>
                <option value="CREATOR">Creator</option>
              </select>
            </label>

            {error && (
              <p className="register-error">
                {error}
              </p>
            )}

            <button className="register-submit" type="submit">
              <span>Create Account</span>
              <span className="register-submit-arrow">→</span>
            </button>
          </form>

          <div className="register-login">
            <span>Already have an account?</span>

            <Link to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}