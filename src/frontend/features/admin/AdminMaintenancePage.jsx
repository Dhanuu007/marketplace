import { useEffect, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'

import { apiRequest } from '../../../services/apiClient.js'

import './admin.css'


export function AdminMaintenancePage() {
  const navigate = useNavigate()

  const { token } = useAuth()

  const messageInputRef = useRef(null)

  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [messageSaving, setMessageSaving] =
    useState(false)
  const [messageSuccess, setMessageSuccess] =
    useState('')
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

          setMessage(
            data?.maintenance?.message ?? '',
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


  function toggleBold() {
    const textarea =
      messageInputRef.current

    if (!textarea) {
      return
    }


    const start =
      textarea.selectionStart

    const end =
      textarea.selectionEnd


    if (start === end) {
      return
    }


    const selectedText =
      message.slice(start, end)


    const before =
      message.slice(0, start)

    const after =
      message.slice(end)


    const alreadyBold =
      before.endsWith('**') &&
      after.startsWith('**')


    let updatedMessage


    if (alreadyBold) {
      updatedMessage =
        before.slice(0, -2) +
        selectedText +
        after.slice(2)
    } else {
      updatedMessage =
        before +
        '**' +
        selectedText +
        '**' +
        after
    }


    if (updatedMessage.length > 500) {
      setError(
        'Maintenance message must be 500 characters or less.',
      )

      return
    }


    setMessage(updatedMessage)
    setMessageSuccess('')
    setError('')


    requestAnimationFrame(() => {
      textarea.focus()


      const offset =
        alreadyBold ? -4 : 4


      textarea.setSelectionRange(
        start,
        end + offset,
      )
    })
  }


  async function saveMessage() {
    if (!token || messageSaving) {
      return
    }


    setMessageSaving(true)
    setError('')
    setMessageSuccess('')


    try {
      const data =
        await apiRequest(
          '/admin/maintenance/message',
          {
            method: 'POST',
            token,
            body: {
              message: message.trim(),
            },
          },
        )


      setMessage(
        data?.maintenance?.message ?? '',
      )


      setMessageSuccess(
        'Maintenance message saved successfully.',
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to save maintenance message.',
      )
    } finally {
      setMessageSaving(false)
    }
  }


  async function toggleMaintenance() {
    if (!token || saving) {
      return
    }


    setSaving(true)
    setError('')
    setMessageSuccess('')


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


      setMessage(
        data?.maintenance?.message ?? message,
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
                  MAINTENANCE MESSAGE
              ===================================== */}

              <div className="admin-maintenance-message">

                <div>

                  <span className="admin-maintenance-label">
                    Maintenance Message
                  </span>

                  <p>
                    Write the message that Buyers and
                    Creators will see while the marketplace
                    is under maintenance.
                  </p>

                </div>


                {/* FORMATTING TOOLBAR */}

                <div className="admin-maintenance-message-toolbar">

                  <button
                    type="button"
                    className="admin-maintenance-format-button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                    }}
                    onClick={toggleBold}
                    disabled={
                      loading ||
                      messageSaving
                    }
                    aria-label="Bold selected text"
                    title="Bold selected text"
                  >
                    <strong>B</strong>
                  </button>

                  <span>
                    Select text and click B to make it bold.
                  </span>

                </div>


                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={(event) => {
                    setMessage(
                      event.target.value,
                    )

                    setMessageSuccess('')
                    setError('')
                  }}
                  maxLength={500}
                  rows={5}
                  placeholder="Example: We're currently performing scheduled maintenance. Please check back shortly."
                  aria-label="Maintenance message"
                />


                <div className="admin-maintenance-message-footer">

                  <span>
                    {message.length}/500
                  </span>


                  <button
                    type="button"
                    className="admin-secondary-button"
                    disabled={
                      loading ||
                      messageSaving
                    }
                    onClick={saveMessage}
                  >
                    {messageSaving
                      ? 'Saving...'
                      : 'Save Message'}
                  </button>

                </div>


                {messageSuccess ? (
                  <div
                    className="admin-form-success"
                    role="status"
                  >
                    {messageSuccess}
                  </div>
                ) : null}

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
                    loading ||
                    saving
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