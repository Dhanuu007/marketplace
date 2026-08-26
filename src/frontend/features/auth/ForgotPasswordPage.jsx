import { useState } from 'react'
import { Link } from 'react-router-dom'

import { requestPasswordReset } from './authApi.js'

import './forgot-password.css'


export function ForgotPasswordPage() {
  const [email, setEmail] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [submitted, setSubmitted] =
    useState(false)


  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      await requestPasswordReset({
        email,
      })

      setSubmitted(true)
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to process your request.',
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="forgot-password-shell">

      <div className="forgot-password-background">

        <span className="forgot-orb forgot-orb-one" />
        <span className="forgot-orb forgot-orb-two" />
        <span className="forgot-orb forgot-orb-three" />

      </div>


      <section className="forgot-password-card">

        <div className="forgot-password-brand">

          <div className="forgot-password-logo">
            M
          </div>

          <div>
            <strong>
              Marketplace
            </strong>

            <span>
              Secure Account Recovery
            </span>
          </div>

        </div>


        {!submitted ? (

          <>

            <div className="forgot-password-heading">

              <span className="forgot-password-eyebrow">
                Account Recovery
              </span>

              <h1>
                Forgot your password?
              </h1>

              <p>
                Enter the email address connected
                to your Marketplace account and
                we&apos;ll send you a secure reset link.
              </p>

            </div>


            <form
              className="forgot-password-form"
              onSubmit={handleSubmit}
            >

              <label>

                <span>
                  Email address
                </span>

                <input
                  autoComplete="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  required
                />

              </label>


              {error && (
                <div
                  className="forgot-password-error"
                  role="alert"
                >
                  {error}
                </div>
              )}


              <button
                className="forgot-password-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Sending reset link...'
                  : 'Send Reset Link'}

                {!loading && (
                  <span aria-hidden="true">
                    →
                  </span>
                )}
              </button>

            </form>


            <div className="forgot-password-security">

              <span className="forgot-security-icon">
                ✓
              </span>

              <p>
                Your account information remains
                private and secure.
              </p>

            </div>

          </>

        ) : (

          <div className="forgot-password-success">

            <div className="forgot-success-icon">
              ✓
            </div>


            <span className="forgot-password-eyebrow">
              Email Sent
            </span>


            <h1>
              Check your email
            </h1>


            <p>
              If an account exists for
              <strong>
                {' '}{email}
              </strong>
              , we&apos;ve sent a password reset
              link to your inbox.
            </p>


            <p className="forgot-success-note">
              The reset link will expire after
              30 minutes.
            </p>

          </div>

        )}


        <Link
          className="forgot-password-back"
          to="/login"
        >
          <span aria-hidden="true">
            ←
          </span>

          Back to Login
        </Link>

      </section>

    </main>
  )
}


export default ForgotPasswordPage