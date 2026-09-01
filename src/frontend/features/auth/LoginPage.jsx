import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from './useAuth.js'

import './auth.css'


export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)


  // =========================================================
  // REDIRECT ALREADY AUTHENTICATED USERS
  // =========================================================

  if (auth.isAuthenticated) {
    if (auth.user?.role === 'ADMIN') {
      return (
        <Navigate
          replace
          to="/admin/dashboard"
        />
      )
    }

    if (auth.user?.role === 'CREATOR') {
      return (
        <Navigate
          replace
          to="/creator/dashboard"
        />
      )
    }

    // BUYER
    return (
      <Navigate
        replace
        to="/buyer/dashboard"
      />
    )
  }


  // =========================================================
  // LOGIN
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    try {
      const data = await auth.login(form)

      const role = data.user?.role


      // ADMIN
      if (role === 'ADMIN') {
        navigate(
          '/admin/dashboard',
          {
            replace: true,
          },
        )

        return
      }


      // CREATOR
      if (role === 'CREATOR') {
        navigate(
          '/creator/dashboard',
          {
            replace: true,
          },
        )

        return
      }


      // BUYER
      navigate(
        '/buyer/dashboard',
        {
          replace: true,
        },
      )
    } catch (authError) {
      setError(
        authError?.message ||
          'Unable to login.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="auth-shell">

      <div className="auth-background" aria-hidden="true">
        <span className="auth-orb auth-orb-one" />
        <span className="auth-orb auth-orb-two" />
        <span className="auth-grid" />
      </div>


      <section className="auth-layout">

        {/* =====================================================
            BRAND / INTRO
        ====================================================== */}

        <div className="auth-intro">

          <Link
            className="auth-brand"
            to="/"
            aria-label="Marketplace home"
          >
            <span className="auth-brand-mark">
              M
            </span>

            <span>
              Market<span>Palce</span>
            </span>
          </Link>


          <div className="auth-intro-content">

            <p className="eyebrow">
              Welcome back
            </p>

            <h1>
              Your marketplace,
              <span> all in one place.</span>
            </h1>

            <p className="auth-intro-description">
              Sign in to manage your account, discover
              digital products, or continue building your
              creator business.
            </p>


            <div className="auth-benefits">

              <div className="auth-benefit">
                <span className="auth-benefit-icon">
                  ✓
                </span>

                <div>
                  <strong>
                    Secure access
                  </strong>

                  <span>
                    Your account stays protected.
                  </span>
                </div>
              </div>


              <div className="auth-benefit">
                <span className="auth-benefit-icon">
                  ✦
                </span>

                <div>
                  <strong>
                    One marketplace
                  </strong>

                  <span>
                    Buy, sell, and manage with ease.
                  </span>
                </div>
              </div>

            </div>

          </div>


          <Link
            className="auth-home-link"
            to="/"
          >
            <span>←</span>
            Back to Marketplace
          </Link>

        </div>


        {/* =====================================================
            LOGIN CARD
        ====================================================== */}

        <div className="auth-card">

          <div className="auth-card-header">

            <div className="auth-card-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 3a4 4 0 0 1 4 4v2h1.5A2.5 2.5 0 0 1 20 11.5v7A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-7A2.5 2.5 0 0 1 6.5 9H8V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v2h4V7a2 2 0 0 0-2-2Zm-5.5 6A.5.5 0 0 0 6 11.5v7a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-11ZM12 13a2 2 0 0 1 1 3.732V18h-2v-1.268A2 2 0 0 1 12 13Z"
                />
              </svg>
            </div>


            <div>
              <p className="eyebrow">
                Authentication
              </p>

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to continue to your account.
              </p>
            </div>

          </div>


          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <label>

              <span>
                Email address
              </span>

              <div className="auth-input-wrapper">

                <svg
                  className="auth-input-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.35l8 5.2 8-5.2V7H4Zm16 10V9.72l-7.46 4.85a1 1 0 0 1-1.08 0L4 9.72V17h16Z"
                  />
                </svg>

                <input
                  autoComplete="email"
                  name="email"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email:
                        event.target.value,
                    }))
                  }
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                />

              </div>

            </label>


            {/* PASSWORD */}

            <label>

              <span>
                Password
              </span>

              <div className="auth-input-wrapper">

                <svg
                  className="auth-input-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3Zm-7-2a2 2 0 0 1 4 0v2h-4V6Zm8 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7Zm-6-5a2 2 0 0 0-1 3.732V18h2v-1.268A2 2 0 0 0 12 13Z"
                  />
                </svg>


                <input
                  autoComplete="current-password"
                  name="password"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password:
                        event.target.value,
                    }))
                  }
                  required
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  value={form.password}
                />


                <button
                  className="password-toggle"
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>

              </div>

            </label>


            <div className="auth-form-meta">

              <Link
                className="auth-forgot-password"
                to="/forgot-password"
              >
                Forgot password?
              </Link>

            </div>


            {/* ERROR */}

            {error && (
              <div
                className="form-error"
                role="alert"
              >
                <span className="form-error-icon">
                  !
                </span>

                <span>
                  {error}
                </span>
              </div>
            )}


            {/* LOGIN BUTTON */}

            <button
              className="auth-submit"
              type="submit"
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <>
                  <span className="auth-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span className="auth-submit-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* CREATE ACCOUNT */}

          <div className="auth-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </div>

      </section>

    </main>
  )
}