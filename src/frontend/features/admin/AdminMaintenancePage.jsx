import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'

import { apiRequest } from '../../../services/apiClient.js'

import './admin.css'


export function AdminMaintenancePage() {
  const navigate = useNavigate()

  const { token } = useAuth()

  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    let isMounted = true


    async function loadMaintenanceStatus() {
      try {
        setError('')

        const data =
          await apiRequest(
            '/maintenance/status',
          )

        if (isMounted) {
          setEnabled(
            data?.maintenance?.enabled === true,
          )
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.message ||
              'Unable to load maintenance status.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }


    loadMaintenanceStatus()


    return () => {
      isMounted = false
    }
  }, [])


  async function toggleMaintenance() {
    if (!token || saving) {
      return
    }


    setSaving(true)
    setError('')


    try {
      const endpoint =
        enabled
          ? '/admin/maintenance/disable'
          : '/admin/maintenance/enable'


      const data =
        await apiRequest(
          endpoint,
          {
            method: 'POST',
            token,
          },
        )


      setEnabled(
        data?.maintenance?.enabled === true,
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to update maintenance mode.',
      )
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="admin-layout">
      <div className="admin-main">

        <main className="admin-content">

          {/* =========================================
              PAGE HEADER
          ========================================= */}

          <section className="admin-page-header">

            <div className="admin-page-header-copy">

              <span className="admin-eyebrow">
                Marketplace
              </span>

              <h1>
                Maintenance
              </h1>

              <p>
                Control marketplace availability and
                temporarily take the website offline.
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
                Back to Dashboard
              </button>

            </div>

          </section>


          {/* =========================================
              MAINTENANCE CONTROL
          ========================================= */}

          <section className="admin-panel admin-maintenance-panel">

            <div className="admin-panel-header">

              <div>

                <span className="admin-panel-eyebrow">
                  System Control
                </span>

                <h2>
                  Maintenance Mode
                </h2>

              </div>

              <div
                className={
                  enabled
                    ? 'admin-maintenance-badge active'
                    : 'admin-maintenance-badge'
                }
              >
                <span
                  className="admin-maintenance-badge-dot"
                  aria-hidden="true"
                />

                {loading
                  ? 'Checking'
                  : enabled
                    ? 'Active'
                    : 'Online'}
              </div>

            </div>


            <div className="admin-maintenance-body">

              {/* =====================================
                  STATUS
              ===================================== */}

              <div
                className={
                  enabled
                    ? 'admin-maintenance-status-card active'
                    : 'admin-maintenance-status-card'
                }
              >

                <div className="admin-maintenance-status-icon">
                  {enabled ? '!' : '✓'}
                </div>


                <div>

                  <span className="admin-maintenance-label">
                    Current Status
                  </span>

                  <h3>
                    {loading
                      ? 'Checking website status...'
                      : enabled
                        ? 'Maintenance is active'
                        : 'Website is online'}
                  </h3>

                  <p>
                    {enabled
                      ? 'Buyers and Creators are blocked from using the marketplace until maintenance is disabled.'
                      : 'The marketplace is currently available to Buyers and Creators.'}
                  </p>

                </div>

              </div>


              {/* =====================================
                  DESCRIPTION
              ===================================== */}

              <div className="admin-maintenance-info">

                <div>

                  <span className="admin-maintenance-label">
                    What happens when enabled?
                  </span>

                  <p>
                    Existing Buyer and Creator sessions
                    are invalidated. New Buyer and Creator
                    logins are blocked, while Admin access
                    remains available.
                  </p>

                </div>


                <div>

                  <span className="admin-maintenance-label">
                    Admin access
                  </span>

                  <p>
                    Admin accounts remain fully accessible
                    so maintenance mode can always be
                    disabled.
                  </p>

                </div>

              </div>


              {/* =====================================
                  ERROR
              ===================================== */}

              {error ? (
                <div
                  className="admin-form-error"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}


              {/* =====================================
                  ACTION
              ===================================== */}

              <div className="admin-maintenance-footer">

                <div>

                  <strong>
                    {enabled
                      ? 'Marketplace is currently offline'
                      : 'Marketplace is currently online'}
                  </strong>

                  <span>
                    {enabled
                      ? 'Disable maintenance when the marketplace is ready.'
                      : 'Enable maintenance before performing system updates.'}
                  </span>

                </div>


                <button
                  type="button"
                  className={
                    enabled
                      ? 'admin-maintenance-action disable'
                      : 'admin-maintenance-action enable'
                  }
                  disabled={
                    loading || saving
                  }
                  onClick={
                    toggleMaintenance
                  }
                >
                  {saving
                    ? 'Updating...'
                    : enabled
                      ? 'Disable Maintenance'
                      : 'Enable Maintenance'}
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>
    </div>
  )
}