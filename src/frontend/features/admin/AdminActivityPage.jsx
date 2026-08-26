import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'

import './admin.css'


export function AdminActivityPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [activity, setActivity] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const { token } = useAuth()

  const navigate = useNavigate()


  // =========================================================
  // LOAD ACTIVITY
  // =========================================================

  useEffect(() => {
    let isMounted = true

    async function loadActivity() {
      if (!token) {
        if (isMounted) {
          setLoading(false)
          setError(
            'Authentication token is unavailable.',
          )
        }

        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          '/admin/activity',
          {
            token,
          },
        )

        if (isMounted) {
          setActivity(
            Array.isArray(data?.activity)
              ? data.activity
              : [],
          )
        }
      } catch (requestError) {
        console.error(
          'Failed to load admin activity:',
          requestError,
        )

        if (isMounted) {
          setError(
            requestError?.message ||
              'Failed to load activity.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadActivity()

    return () => {
      isMounted = false
    }
  }, [token])


  // =========================================================
  // FORMAT TIME
  // =========================================================

  function formatActivityTime(value) {
    if (!value) {
      return '—'
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—'
    }

    const now =
      new Date()

    const difference =
      Math.max(
        0,
        now.getTime() -
          date.getTime(),
      )

    const minutes =
      Math.floor(
        difference /
          (1000 * 60),
      )

    if (minutes < 1) {
      return 'now'
    }

    if (minutes < 60) {
      return `${minutes}m`
    }

    const hours =
      Math.floor(
        minutes / 60,
      )

    if (hours < 24) {
      return `${hours}h`
    }

    const days =
      Math.floor(
        hours / 24,
      )

    if (days < 7) {
      return `${days}d`
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    )
  }


  // =========================================================
  // ACTIVITY ICON
  // =========================================================

  function getActivityIcon(type) {
    switch (type) {
      case 'CREATOR':
        return 'C'

      case 'BUYER':
        return 'B'

      case 'ORDER':
        return 'O'

      case 'PAYMENT':
        return '₹'

      default:
        return '•'
    }
  }


  return (
    <div className="admin-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <AdminSidebar
        isOpen={sidebarOpen}
        onNavigate={() =>
          setSidebarOpen(false)
        }
      />


      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay visible"
          type="button"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="admin-main">

        <AdminTopbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />


        <main className="admin-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="admin-page-header">

            <div className="admin-page-header-copy">

              <span className="admin-eyebrow">
                Marketplace
              </span>

              <h1>
                Recent Activity
              </h1>

              <p>
                View the latest activity across
                your marketplace.
              </p>

            </div>


            <div className="admin-header-actions">

              <button
                className="admin-secondary-button"
                type="button"
                onClick={() =>
                  navigate('/admin/dashboard')
                }
              >
                ← Dashboard
              </button>

            </div>

          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '10px',
              }}
            >
              {error}
            </div>
          )}


          {/* =================================================
              ACTIVITY PANEL
          ================================================= */}

          <section className="admin-panel">

            <div className="admin-panel-header">

              <div>

                <span className="admin-panel-eyebrow">
                  Activity
                </span>

                <h2>
                  Marketplace Activity
                </h2>

              </div>


              {!loading && (
                <span className="admin-panel-action">
                  {activity.length}{' '}
                  {activity.length === 1
                    ? 'event'
                    : 'events'}
                </span>
              )}

            </div>


            <div className="admin-activity-list">

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (

                <div className="admin-activity-item">

                  <div className="admin-activity-content">

                    <strong>
                      Loading activity...
                    </strong>

                    <p>
                      Fetching the latest
                      marketplace events.
                    </p>

                  </div>

                </div>

              )}


              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loading &&
                !error &&
                activity.length === 0 && (

                  <div className="admin-activity-item">

                    <div className="admin-activity-icon">
                      —
                    </div>

                    <div className="admin-activity-content">

                      <strong>
                        No activity yet
                      </strong>

                      <p>
                        Marketplace activity
                        will appear here.
                      </p>

                    </div>

                  </div>

                )}


              {/* =================================================
                  ACTIVITY
              ================================================= */}

              {!loading &&
                !error &&
                activity.length > 0 &&

                activity.map(
                  (item, index) => (

                    <div
                      className="admin-activity-item"
                      key={
                        item.id ||
                        `${item.type}-${item.referenceId || ''}-${item.createdAt}-${index}`
                      }
                    >

                      <div className="admin-activity-icon">

                        {getActivityIcon(
                          item.type,
                        )}

                      </div>


                      <div className="admin-activity-content">

                        <strong>
                          {item.title}
                        </strong>

                        <p>
                          {item.message}
                        </p>

                      </div>


                      <time>
                        {formatActivityTime(
                          item.createdAt,
                        )}
                      </time>

                    </div>

                  ),
                )}

            </div>

          </section>

        </main>

      </div>

    </div>
  )
}


export default AdminActivityPage