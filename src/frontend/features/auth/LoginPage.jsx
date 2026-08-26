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
    }
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="auth-shell">

      <section className="auth-card">

        <p className="eyebrow">
          Authentication
        </p>


        <h1>
          Login
        </h1>


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <label>

            <span>
              Email
            </span>


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
              value={form.email}
            />

          </label>


          <label>

            <span>
              Password
            </span>


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
              type="password"
              value={form.password}
            />

          </label>


          {error && (
            <p className="form-error">
              {error}
            </p>
          )}


          <button type="submit">
            Login
          </button>

          <Link
          className="auth-forgot-password"
          to="/forgot-password"
        >
          Forgot Password?
         </Link>

        </form>


        <Link to="/register">
          Create an account
        </Link>

        <Link to="/">
          ← Back to Home
        </Link>

      </section>

    </main>
  )
}