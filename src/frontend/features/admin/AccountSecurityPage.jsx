import { useCallback, useEffect, useMemo, useState } from 'react'

import { apiRequest } from '../../../services/apiClient.js'
import { useAuth } from '../auth/authContext.js'
import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'
import './accountSecurity.css'

export function AccountSecurityPage() {
  const { token } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [processingId, setProcessingId] = useState(null)

  const [suspendTarget, setSuspendTarget] =
    useState(null)
  const [suspensionReason, setSuspensionReason] =
    useState('')

  const loadUsers = useCallback(
    async (showLoader = false) => {
      if (!token) return

      if (showLoader) {
        setLoading(true)
      }

      try {
        const data = await apiRequest(
          '/admin/account-security',
          {
            token,
          },
        )

        setUsers(data?.users ?? [])
        setError('')
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load account security data.',
        )
      } finally {
        if (showLoader) {
          setLoading(false)
        }
      }
    },
    [token],
  )

 useEffect(() => {
  let cancelled = false

  async function fetchUsers() {
    if (!token) return

    setLoading(true)

    try {
      const data = await apiRequest(
        '/admin/account-security',
        {
          token,
        },
      )

      if (!cancelled) {
        setUsers(data?.users ?? [])
        setError('')
      }
    } catch (requestError) {
      if (!cancelled) {
        setError(
          requestError?.message ||
            'Unable to load account security data.',
        )
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  fetchUsers()

  return () => {
    cancelled = true
  }
}, [token])

  useEffect(() => {
    if (!token) return undefined

    const intervalId =
      window.setInterval(() => {
        loadUsers(false)
      }, 15 * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [token, loadUsers])

  const creators = useMemo(
    () =>
      users.filter(
        (user) => user.role === 'CREATOR',
      ),
    [users],
  )

  const buyers = useMemo(
    () =>
      users.filter(
        (user) => user.role === 'BUYER',
      ),
    [users],
  )

  const onlineCreators = creators.filter(
    (user) => user.isOnline,
  ).length

  const onlineBuyers = buyers.filter(
    (user) => user.isOnline,
  ).length

  const totalOnline =
    onlineCreators + onlineBuyers

  const suspendedCount = users.filter(
    (user) => user.suspended,
  ).length

  function openSuspendModal(user) {
    setActionError('')
    setSuspensionReason('')
    setSuspendTarget(user)
  }

  function closeSuspendModal() {
    if (processingId) return

    setSuspendTarget(null)
    setSuspensionReason('')
  }

  async function handleSuspend() {
    if (!suspendTarget || !token) return

    const reason =
      suspensionReason.trim()

    if (!reason) {
      setActionError(
        'Please provide a reason for the suspension.',
      )
      return
    }

    setProcessingId(suspendTarget.id)
    setActionError('')

    try {
      await apiRequest(
        `/admin/account-security/${suspendTarget.id}/suspend`,
        {
          method: 'POST',
          token,
          body: {
            reason,
          },
        },
      )

      closeSuspendModal()
      await loadUsers(false)
    } catch (requestError) {
      setActionError(
        requestError?.message ||
          'Unable to suspend this account.',
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function handleUnsuspend(user) {
    if (!token) return

    const confirmed =
      window.confirm(
        `Unsuspend ${user.name || user.email}?`,
      )

    if (!confirmed) return

    setProcessingId(user.id)
    setActionError('')

    try {
      await apiRequest(
        `/admin/account-security/${user.id}/unsuspend`,
        {
          method: 'POST',
          token,
        },
      )

      await loadUsers(false)
    } catch (requestError) {
      setActionError(
        requestError?.message ||
          'Unable to unsuspend this account.',
      )
    } finally {
      setProcessingId(null)
    }
  }

  function renderUserTable(
    title,
    description,
    userList,
  ) {
    return (
      <section className="security-panel">
        <div className="security-panel-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <span className="security-count">
            {userList.length}
          </span>
        </div>

        {userList.length === 0 ? (
          <div className="security-empty">
            No accounts found.
          </div>
        ) : (
          <div className="security-table-wrap">
            <table className="security-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Online</th>
                  <th>Account Status</th>
                  <th>Suspension Reason</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {userList.map((user) => {
                  const processing =
                    processingId === user.id

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="security-user">
                          <div className="security-avatar">
                            {(
                              user.name ||
                              user.email ||
                              '?'
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {user.name ||
                                'Unnamed User'}
                            </strong>
                            <span>
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="role-badge">
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`online-status ${
                            user.isOnline
                              ? 'online'
                              : 'offline'
                          }`}
                        >
                          <span className="status-dot" />
                          {user.isOnline
                            ? 'Online'
                            : 'Offline'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`account-status ${
                            user.suspended
                              ? 'suspended'
                              : 'active'
                          }`}
                        >
                          {user.suspended
                            ? 'Suspended'
                            : 'Active'}
                        </span>
                      </td>

                      <td>
                        {user.suspended &&
                        user.suspensionReason ? (
                          <span className="reason-text">
                            {user.suspensionReason}
                          </span>
                        ) : (
                          <span className="reason-empty">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        {user.suspended ? (
                          <button
                            type="button"
                            className="security-action-button unsuspend"
                            disabled={processing}
                            onClick={() =>
                              handleUnsuspend(user)
                            }
                          >
                            {processing
                              ? 'Updating...'
                              : 'Unsuspend'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="security-action-button suspend"
                            disabled={processing}
                            onClick={() =>
                              openSuspendModal(user)
                            }
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminTopbar />

        <div className="account-security-page">
          <div className="security-page-header">
            <div>
              <span className="security-eyebrow">
                ACCOUNT SECURITY
              </span>

              <h1>
                Creator &amp; Buyer Security
              </h1>

              <p>
                Monitor active users and temporarily
                suspend accounts when suspicious
                activity is detected.
              </p>
            </div>
          </div>

          {error && (
            <div className="security-alert error">
              {error}
            </div>
          )}

          {actionError && !suspendTarget && (
            <div className="security-alert error">
              {actionError}
            </div>
          )}

          <div className="security-stats">
            <div className="security-stat-card">
              <span className="security-stat-label">
                Creators Online
              </span>

              <strong>
                {onlineCreators}
              </strong>

              <span>
                of {creators.length} creators
              </span>
            </div>

            <div className="security-stat-card">
              <span className="security-stat-label">
                Buyers Online
              </span>

              <strong>
                {onlineBuyers}
              </strong>

              <span>
                of {buyers.length} buyers
              </span>
            </div>

            <div className="security-stat-card">
              <span className="security-stat-label">
                Total Online
              </span>

              <strong>
                {totalOnline}
              </strong>

              <span>
                currently active
              </span>
            </div>

            <div className="security-stat-card warning">
              <span className="security-stat-label">
                Suspended Accounts
              </span>

              <strong>
                {suspendedCount}
              </strong>

              <span>
                creators &amp; buyers
              </span>
            </div>
          </div>

          {loading ? (
            <div className="security-loading">
              Loading account security...
            </div>
          ) : (
            <>
              {renderUserTable(
                'Creators',
                'Monitor creator activity and account status.',
                creators,
              )}

              {renderUserTable(
                'Buyers',
                'Monitor buyer activity and account status.',
                buyers,
              )}
            </>
          )}
        </div>
      </main>

      {suspendTarget && (
        <div
          className="security-modal-backdrop"
          role="presentation"
          onMouseDown={closeSuspendModal}
        >
          <div
            className="security-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suspend-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="security-modal-icon">
              !
            </div>

            <div className="security-modal-heading">
              <h2 id="suspend-title">
                Suspend Account
              </h2>

              <p>
                You are suspending{' '}
                <strong>
                  {suspendTarget.name ||
                    suspendTarget.email}
                </strong>
                .
              </p>
            </div>

            <label
              htmlFor="suspension-reason"
              className="security-modal-label"
            >
              Suspension reason
            </label>

            <textarea
              id="suspension-reason"
              className="security-reason-input"
              value={suspensionReason}
              onChange={(event) =>
                setSuspensionReason(
                  event.target.value,
                )
              }
              placeholder="Example: Suspicious activity detected on submitted listings."
              rows={5}
              maxLength={500}
              disabled={Boolean(processingId)}
            />

            <div className="security-character-count">
              {suspensionReason.length}/500
            </div>

            {actionError && (
              <div className="security-alert error modal-error">
                {actionError}
              </div>
            )}

            <div className="security-modal-actions">
              <button
                type="button"
                className="security-modal-button cancel"
                onClick={closeSuspendModal}
                disabled={Boolean(processingId)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="security-modal-button confirm"
                onClick={handleSuspend}
                disabled={Boolean(processingId)}
              >
                {processingId
                  ? 'Suspending...'
                  : 'Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}