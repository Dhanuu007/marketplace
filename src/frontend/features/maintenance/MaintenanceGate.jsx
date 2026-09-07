import { useEffect, useState } from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { MaintenanceScreen } from './MaintenanceScreen.jsx'

const CHECK_INTERVAL = 5000

export function MaintenanceGate({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  const [maintenance, setMaintenance] = useState({
  enabled: false,
  message: '',
})
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkMaintenance() {
      try {
        const data =
          await apiRequest(
            '/maintenance/status',
          )

        const enabled =
          data?.maintenance?.enabled === true

          
          const message =
              data?.maintenance?.message ?? ''
          

        if (!isMounted) {
          return
        }

        setMaintenance({
  enabled,
  message,
        })

        /*
         * If a Buyer or Creator is currently logged in
         * when maintenance starts, clear their session
         * and send them to the marketplace home.
         */
        if (
          enabled &&
          user &&
          user.role !== 'ADMIN'
        ) {
          await logout()

          if (isMounted) {
            navigate('/', {
              replace: true,
            })
          }

          return
        }
      } catch (error) {
        console.error(
          'Maintenance status check failed:',
          error,
        )
      } finally {
        if (isMounted) {
          setChecking(false)
        }
      }
    }

    checkMaintenance()

    const intervalId =
      window.setInterval(
        checkMaintenance,
        CHECK_INTERVAL,
      )

    return () => {
      isMounted = false
      window.clearInterval(
        intervalId,
      )
    }
  }, [
    logout,
    navigate,
    user,
  ])

  /*
   * Admin always has full access.
   *
   * This is important because the Admin must be able
   * to control maintenance mode.
   */
  if (user?.role === 'ADMIN') {
    return children
  }

  /*
   * The login page must remain accessible during
   * maintenance so an Admin whose session expired
   * can log back in.
   *
   * Buyer/Creator login attempts are still blocked
   * by the backend.
   */
  if (location.pathname === '/login') {
    return children
  }

  /*
   * Wait for the first maintenance check.
   */
  if (checking) {
    return null
  }

  /*
   * Guests, Buyers and Creators see the maintenance
   * screen while maintenance is active.
   */
 if (maintenance.enabled) {
  return (
    <MaintenanceScreen
      message={maintenance.message}
    />
  )
}

  return children
}