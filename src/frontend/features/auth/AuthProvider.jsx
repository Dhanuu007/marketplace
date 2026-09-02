import { useEffect, useState } from 'react'

import { AuthContext } from './authContext.js'

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  sendHeartbeat,
} from './authApi.js'


const TOKEN_STORAGE_KEY =
  'market-palce-token'


export function AuthProvider({
  children,
}) {
  const [token, setToken] =
    useState(() =>
      sessionStorage.getItem(
        TOKEN_STORAGE_KEY,
      ),
    )


  const [user, setUser] =
    useState(null)


  const [status, setStatus] =
    useState(
      token
        ? 'loading'
        : 'ready',
    )


  useEffect(() => {
    let isMounted = true


    async function loadCurrentUser() {
      if (!token) {
        if (isMounted) {
          setUser(null)
          setStatus('ready')
        }

        return
      }


      setStatus('loading')


      try {
        const data =
          await getCurrentUser(
            token,
          )


        if (isMounted) {
          setUser(
            data.user,
          )

          setStatus('ready')
        }
      } catch {
        sessionStorage.removeItem(
          TOKEN_STORAGE_KEY,
        )


        if (isMounted) {
          setToken(null)
          setUser(null)
          setStatus('ready')
        }
      }
    }


    loadCurrentUser()


    return () => {
      isMounted = false
    }
  }, [token])


  // =======================================================
  // ONLINE PRESENCE HEARTBEAT
  // =======================================================

    useEffect(() => {
    if (!token || !user?.id) {
      return undefined
    }


    let isActive = true


    async function heartbeat() {
      try {
        const data =
          await sendHeartbeat(
            token,
          )


        if (isActive && data?.user) {
          setUser(
            data.user,
          )
        }
      } catch {
        // Authentication errors are handled by
        // the normal auth/session flow.
      }
    }


    // Send immediately when authenticated
    heartbeat()


    // Keep lastSeenAt fresh while the user is active
    const intervalId =
      window.setInterval(
        heartbeat,
        30 * 1000,
      )


    return () => {
      isActive = false
      window.clearInterval(
        intervalId,
      )
    }
  }, [token, user?.id])


  async function register(input) {
    const data =
      await registerUser(input)


    saveSession(data)


    return data
  }


  async function login(input) {
    const data =
      await loginUser(input)


    saveSession(data)


    return data
  }


  async function logout() {
    if (token) {
      await logoutUser(
        token,
      ).catch(
        () => null,
      )
    }


    sessionStorage.removeItem(
      TOKEN_STORAGE_KEY,
    )


    setToken(null)
    setUser(null)
    setStatus('ready')
  }


  function saveSession(data) {
    sessionStorage.setItem(
      TOKEN_STORAGE_KEY,
      data.token,
    )


    setToken(data.token)
    setUser(data.user)
    setStatus('ready')
  }


  const value = {
    isAuthenticated:
      Boolean(
        user &&
        token,
      ),

    login,

    logout,

    register,

    status,

    token,

    user,
  }


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}