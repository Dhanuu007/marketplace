
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'

import './admin.css'
import './AdminMessagesPage.css'

function AdminAnnouncementsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [announcementToDelete, setAnnouncementToDelete] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { token } = useAuth()
  const navigate = useNavigate()

  // LOAD ANNOUNCEMENTS
  useEffect(() => {
    let isMounted = true

    async function fetchAnnouncements() {
      if (!token) {
        setLoading(false)
        setError('Authentication token is unavailable.')
        return
      }

      try {
        setLoading(true)

        const data = await apiRequest('/admin/announcements', {
          method: 'GET',
          token,
        })

        if (isMounted) {
          setAnnouncements(
            Array.isArray(data?.announcements)
              ? data.announcements
              : [],
          )
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.message ||
              'Unable to load announcements.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAnnouncements()

    return () => {
      isMounted = false
    }
  }, [token])

  // REFRESH ANNOUNCEMENTS
  async function loadAnnouncements() {
    if (!token) return

    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/admin/announcements', {
        method: 'GET',
        token,
      })

      setAnnouncements(
        Array.isArray(data?.announcements)
          ? data.announcements
          : [],
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to load announcements.',
      )
    } finally {
      setLoading(false)
    }
  }

  // PUBLISH ANNOUNCEMENT
  async function publishAnnouncement(event) {
    event.preventDefault()

    if (!token || publishing) return

    const cleanTitle = title.trim()
    const cleanMessage = message.trim()

    if (!cleanTitle || !cleanMessage) {
      setError('Please enter both title and message.')
      return
    }

    try {
      setPublishing(true)
      setError('')
      setSuccess('')

      const data = await apiRequest('/admin/announcements', {
        method: 'POST',
        token,
        body: {
          title: cleanTitle,
          message: cleanMessage,
        },
      })

      if (data?.announcement) {
        setAnnouncements((current) => [
          data.announcement,
          ...current,
        ])
      } else {
        await loadAnnouncements()
      }

      setTitle('')
      setMessage('')

      setSuccess(
        `Announcement published! ${data?.successfulNotifications ?? 0} of ${data?.totalRecipients ?? 0} notifications sent successfully.`,
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to publish announcement.',
      )
    } finally {
      setPublishing(false)
    }
  }

  // OPEN DELETE CONFIRMATION
  function handleDeleteAnnouncement(announcement) {
    if (!token || deletingId) return
    setAnnouncementToDelete(announcement)
  }

  // CONFIRM DELETE ANNOUNCEMENT
  async function confirmDeleteAnnouncement() {
    if (!token || !announcementToDelete || deletingId) return

    const announcement = announcementToDelete

    try {
      setDeletingId(announcement.id)
      setError('')
      setSuccess('')

      await apiRequest(
        `/admin/announcements/${announcement.id}`,
        {
          method: 'DELETE',
          token,
        },
      )

      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcement.id),
      )

      setAnnouncementToDelete(null)
      setSuccess('Announcement deleted successfully.')
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to delete announcement.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  // FORMAT DATE
  function formatDate(value) {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return '—'

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay visible"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="admin-main">
        <AdminTopbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="admin-content">
          <section className="admin-page-header">
            <div className="admin-page-header-copy">
              <span className="admin-eyebrow">
                Marketplace Communication
              </span>

              <h1>Announcements</h1>

              <p>
                Broadcast important updates to all registered
                Buyers and Creators.
              </p>
            </div>

            <div className="admin-header-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => navigate('/admin/dashboard')}
              >
                Dashboard
              </button>
            </div>
          </section>

          {error && (
            <div className="admin-dashboard-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="admin-messages-success" role="status">
              {success}
            </div>
          )}

          <div className="admin-messages-content">
            {/* CREATE ANNOUNCEMENT */}
            <section className="admin-panel admin-message-compose">
              <div className="admin-panel-header">
                <div>
                  <span className="admin-panel-eyebrow">
                    Broadcast Message
                  </span>

                  <h2>Create Announcement</h2>
                </div>

                <span className="admin-message-audience">
                  Buyers + Creators
                </span>
              </div>

              <p className="admin-message-description">
                Your announcement will be delivered as a notification
                to all registered Buyers and Creators.
              </p>

              <form onSubmit={publishAnnouncement}>
                <div className="admin-message-field">
                  <label htmlFor="announcement-title">
                    Announcement Title
                  </label>

                  <input
                    id="announcement-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter announcement title"
                    maxLength={120}
                    required
                    disabled={publishing}
                  />

                  <span>{title.length}/120</span>
                </div>

                <div className="admin-message-field">
                  <label htmlFor="announcement-message">
                    Announcement Message
                  </label>

                  <textarea
                    id="announcement-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write your announcement here..."
                    rows={6}
                    maxLength={2000}
                    required
                    disabled={publishing}
                  />

                  <span>{message.length}/2000</span>
                </div>

                <div className="admin-message-compose-footer">
                  <p>
                    <span>ⓘ</span>
                    This announcement will be sent to both user roles.
                  </p>

                  <button
                    type="submit"
                    className="admin-message-publish-button"
                    disabled={publishing}
                  >
                    {publishing
                      ? 'Publishing...'
                      : 'Publish Announcement →'}
                  </button>
                </div>
              </form>
            </section>

            {/* ANNOUNCEMENT HISTORY */}
            <section className="admin-panel admin-message-history">
              <div className="admin-panel-header">
                <div>
                  <span className="admin-panel-eyebrow">
                    Message History
                  </span>

                  <h2>Published Announcements</h2>
                </div>

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={loadAnnouncements}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : '↻ Refresh'}
                </button>
              </div>

              {loading ? (
                <div className="admin-message-empty">
                  Loading announcements...
                </div>
              ) : announcements.length === 0 ? (
                <div className="admin-message-empty">
                  <div>📢</div>
                  <strong>No announcements yet</strong>

                  <p>
                    Your published announcements will appear here.
                  </p>
                </div>
              ) : (
                <div className="admin-announcement-list">
                  {announcements.map((announcement) => (
                    <article
                      className="admin-announcement-item"
                      key={announcement.id}
                    >
                      <div className="admin-announcement-icon">
                        📢
                      </div>

                      <div className="admin-announcement-details">
                        <div className="admin-announcement-heading">
                          <h3>{announcement.title}</h3>

                          <span>
                            {announcement.status || 'PUBLISHED'}
                          </span>
                        </div>

                        <p>{announcement.message}</p>

                        <div className="admin-announcement-meta">
                          <span>Buyers + Creators</span>

                          <span>
                            {formatDate(announcement.createdAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="admin-secondary-button"
                        style={{
                          color: '#dc2626',
                          borderColor: '#fecaca',
                          flexShrink: 0,
                        }}
                        onClick={() =>
                          handleDeleteAnnouncement(announcement)
                        }
                        disabled={deletingId !== null}
                        aria-label={`Delete ${announcement.title}`}
                      >
                        {deletingId === announcement.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {announcementToDelete && (
        <>
          <style>{`
            .announcement-delete-backdrop {
              position: fixed;
              inset: 0;
              z-index: 10000;
              display: grid;
              place-items: center;
              padding: 20px;
              background: rgba(15, 23, 42, 0.58);
              backdrop-filter: blur(7px);
              -webkit-backdrop-filter: blur(7px);
              animation: announcementFadeIn 180ms ease-out;
            }
            .announcement-delete-modal {
              width: min(100%, 430px);
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 22px;
              background: #ffffff;
              color: #111827;
              box-shadow: 0 24px 80px rgba(15, 23, 42, 0.24);
              text-align: center;
              animation: announcementModalIn 220ms cubic-bezier(.2,.8,.2,1);
            }
            .announcement-delete-icon {
              width: 62px;
              height: 62px;
              margin: 0 auto 18px;
              display: grid;
              place-items: center;
              border-radius: 19px;
              color: #e11d48;
              background: #fff1f2;
            }
            .announcement-delete-modal h2 {
              margin: 0;
              color: #111827;
              font-size: 22px;
              font-weight: 800;
              letter-spacing: -0.035em;
            }
            .announcement-delete-modal p {
              margin: 11px 0 25px;
              color: #64748b;
              font-size: 14px;
              line-height: 1.7;
            }
            .announcement-delete-actions {
              display: flex;
              gap: 11px;
            }
            .announcement-delete-actions button {
              flex: 1;
              min-height: 46px;
              border-radius: 12px;
              font: inherit;
              font-size: 14px;
              font-weight: 750;
              cursor: pointer;
              transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
            }
            .announcement-delete-actions button:hover:not(:disabled) {
              transform: translateY(-1px);
            }
            .announcement-delete-cancel {
              border: 1px solid #e2e8f0;
              color: #334155;
              background: #ffffff;
            }
            .announcement-delete-cancel:hover:not(:disabled) {
              background: #f8fafc;
            }
            .announcement-delete-confirm {
              border: 1px solid #e11d48;
              color: #ffffff;
              background: #e11d48;
              box-shadow: 0 7px 16px rgba(225, 29, 72, 0.2);
            }
            .announcement-delete-confirm:hover:not(:disabled) {
              background: #be123c;
            }
            .announcement-delete-actions button:disabled {
              opacity: .65;
              cursor: not-allowed;
            }
            @keyframes announcementFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes announcementModalIn {
              from { opacity: 0; transform: translateY(10px) scale(.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @media (max-width: 480px) {
              .announcement-delete-modal { padding: 25px 20px; }
            }
            @media (prefers-reduced-motion: reduce) {
              .announcement-delete-backdrop,
              .announcement-delete-modal { animation: none; }
            }
          `}</style>

          <div
            className="announcement-delete-backdrop"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                deletingId === null
              ) {
                setAnnouncementToDelete(null)
              }
            }}
          >
            <section
              className="announcement-delete-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="announcement-delete-title"
              aria-describedby="announcement-delete-description"
            >
              <div className="announcement-delete-icon" aria-hidden="true">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="m19 6-1 14H6L5 6" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
              </div>

              <h2 id="announcement-delete-title">
                Delete announcement?
              </h2>

              <p id="announcement-delete-description">
                Are you sure you want to delete{' '}
                <strong>“{announcementToDelete.title}”</strong>?
                It will disappear from announcement history and user
                notifications.
              </p>

              <div className="announcement-delete-actions">
                <button
                  type="button"
                  className="announcement-delete-cancel"
                  onClick={() => setAnnouncementToDelete(null)}
                  disabled={deletingId !== null}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="announcement-delete-confirm"
                  onClick={confirmDeleteAnnouncement}
                  disabled={deletingId !== null}
                >
                  {deletingId !== null ? 'Deleting...' : 'Yes, delete'}
                </button>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminAnnouncementsPage
