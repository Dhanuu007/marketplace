import { useEffect, useState } from 'react'

import { AuthContext } from './authContext.js'

import {
  getCurrentUser,
  getSuspensionStatus,
  loginUser,
  logoutUser,
  registerUser,
  sendHeartbeat,
} from './authApi.js'


const TOKEN_STORAGE_KEY =
  'market-palce-token'


export function AuthProvider({ children }) {

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


  // =======================================================
  // LOAD CURRENT USER
  // =======================================================

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

      } catch (error) {

        /*
         * Suspended users cannot access /auth/me
         * because requireAuth intentionally blocks them.
         *
         * Recover their restricted account status through
         * the dedicated suspension-status endpoint instead.
         */

        if (
          error?.code ===
          'ACCOUNT_SUSPENDED'
        ) {

          try {

            const suspensionData =
              await getSuspensionStatus(
                token,
              )


            if (
              isMounted &&
              suspensionData?.user
            ) {

              setUser(
                suspensionData.user,
              )

              setStatus(
                'ready',
              )

              return
            }

          } catch {
            /*
             * If the suspension-status request also fails,
             * the token/session is no longer usable.
             */
          }
        }


        /*
         * Any other authentication failure
         * invalidates the local session.
         */

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

    /*
     * Suspended users must never be marked online.
     */

    if (
      !token ||
      !user?.id ||
      user?.suspended
    ) {
      return undefined
    }


    let isActive = true


    async function heartbeat() {

      try {

        const data =
          await sendHeartbeat(
            token,
          )


        if (
          isActive &&
          data?.user
        ) {

          setUser(
            data.user,
          )
        }

      } catch (error) {

        /*
         * If an Admin suspends this user while
         * they are already logged in, the next
         * heartbeat will receive ACCOUNT_SUSPENDED.
         *
         * Convert the current session into the
         * restricted dashboard state.
         */

        if (
          error?.code ===
          'ACCOUNT_SUSPENDED'
        ) {

          try {

            const suspensionData =
              await getSuspensionStatus(
                token,
              )


            if (
              isActive &&
              suspensionData?.user
            ) {

              setUser(
                suspensionData.user,
              )
            }

          } catch {
            // Keep the existing session state.
          }
        }
      }
    }


    heartbeat()


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

  }, [
    token,
    user?.id,
    user?.suspended,
  ])


  // =======================================================
  // REGISTER
  // =======================================================

  async function register(input) {

    const data =
      await registerUser(
        input,
      )

    saveSession(
      data,
    )

    return data
  }


  // =======================================================
  // LOGIN
  // =======================================================

  async function login(input) {

    const data =
      await loginUser(
        input,
      )

    saveSession(
      data,
    )

    return data
  }


  // =======================================================
  // LOGOUT
  // =======================================================

  async function logout() {

    /*
     * Suspended accounts cannot pass requireAuth,
     * so the backend logout request may return 403.
     *
     * We still clear the local session regardless.
     */

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


  // =======================================================
  // SAVE SESSION
  // =======================================================

  function saveSession(data) {

    sessionStorage.setItem(
      TOKEN_STORAGE_KEY,
      data.token,
    )


    setToken(
      data.token,
    )


    setUser(
      data.user,
    )


    setStatus(
      'ready',
    )
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