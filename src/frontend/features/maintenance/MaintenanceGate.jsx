
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
    startedAt: null,
    endAt: null,
    appearance: {},
  })

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkMaintenance() {
      try {
        const data = await apiRequest('/maintenance/status')
        const status = data?.maintenance

        if (!isMounted) return

        const enabled = status?.enabled === true

        setMaintenance({
          enabled,
          message: status?.message ?? '',
          startedAt: status?.startedAt ?? null,
          endAt: status?.endAt ?? null,
          appearance: status?.appearance ?? {},
        })

        /*
         * Clear Buyer and Creator sessions when
         * maintenance mode is active.
         */
        if (enabled && user && user.role !== 'ADMIN') {
          await logout()

          if (isMounted) {
            navigate('/', { replace: true })
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

    const intervalId = window.setInterval(
      checkMaintenance,
      CHECK_INTERVAL,
    )

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [logout, navigate, user])

  // Admin always has access to the dashboard.
  if (user?.role === 'ADMIN') {
    return children
  }

  // Keep the login page accessible.
  if (location.pathname === '/login') {
    return children
  }

  // Wait for the initial maintenance check.
  if (checking) {
    return null
  }

  if (maintenance.enabled) {
    return (
      <MaintenanceScreen
        message={maintenance.message}
        startedAt={maintenance.startedAt}
        endAt={maintenance.endAt}
        appearance={maintenance.appearance}
      />
    )
  }

  return children
}
