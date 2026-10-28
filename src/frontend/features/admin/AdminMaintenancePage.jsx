import { useEffect, useRef, useState } from 'react'

import { AdminLayout } from './components/AdminLayout.jsx'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'

import { apiRequest } from '../../../services/apiClient.js'

import './admin.css'

const DEFAULT_APPEARANCE = {
  background: '#1a1a1a',
  panel: '#2d2d2d',
  border: '#4a4a4a',
  accent: '#e85d3a',
  accentHighlight: '#f07b4f',
  accentDark: '#c24826',
  heading: '#f5f5f5',
  text: '#e5e5e5',
  muted: '#a3a3a3',
  buttonBackground: '#e85d3a',
  buttonText: '#ffffff',
  progressTrack: '#4a4a4a',
  progressFill: '#e85d3a',
}

const THEME_PRESETS = [
  {
    name: 'Charcoal & Ember',
    colors: { background: '#1a1a1a', panel: '#2d2d2d', border: '#4a4a4a', accent: '#e85d3a', accentHighlight: '#f07b4f', accentDark: '#c24826', heading: '#f5f5f5', text: '#e5e5e5', muted: '#a3a3a3', buttonBackground: '#e85d3a', buttonText: '#ffffff', progressTrack: '#4a4a4a', progressFill: '#e85d3a' },
  },
  {
    name: 'Midnight & Teal',
    colors: { background: '#101820', panel: '#1b2b34', border: '#31515b', accent: '#14b8a6', accentHighlight: '#5eead4', accentDark: '#0f766e', heading: '#f0fdfa', text: '#ccfbf1', muted: '#94a3b8', buttonBackground: '#14b8a6', buttonText: '#062925', progressTrack: '#31515b', progressFill: '#14b8a6' },
  },
  {
    name: 'Ocean Blue',
    colors: { background: '#0b1220', panel: '#17243a', border: '#304563', accent: '#3b82f6', accentHighlight: '#93c5fd', accentDark: '#1d4ed8', heading: '#eff6ff', text: '#dbeafe', muted: '#9caec7', buttonBackground: '#2563eb', buttonText: '#ffffff', progressTrack: '#304563', progressFill: '#3b82f6' },
  },
  {
    name: 'Emerald',
    colors: { background: '#101b16', panel: '#1c3026', border: '#355541', accent: '#22c55e', accentHighlight: '#86efac', accentDark: '#15803d', heading: '#f0fdf4', text: '#dcfce7', muted: '#a3b8aa', buttonBackground: '#16a34a', buttonText: '#ffffff', progressTrack: '#355541', progressFill: '#22c55e' },
  },
  {
    name: 'Purple Neon',
    colors: { background: '#171225', panel: '#29203b', border: '#4c3b67', accent: '#a855f7', accentHighlight: '#d8b4fe', accentDark: '#7e22ce', heading: '#faf5ff', text: '#f3e8ff', muted: '#b7a9c9', buttonBackground: '#9333ea', buttonText: '#ffffff', progressTrack: '#4c3b67', progressFill: '#a855f7' },
  },
]

function toLocalDateTimeValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}


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
  const [appearance, setAppearance] = useState(DEFAULT_APPEARANCE)
  const [savedAppearance, setSavedAppearance] = useState(DEFAULT_APPEARANCE)
  const [endAt, setEndAt] = useState('')
  const [savedEndAt, setSavedEndAt] = useState('')
  const [appearanceSaving, setAppearanceSaving] = useState(false)
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [appearanceSuccess, setAppearanceSuccess] = useState('')
  const [scheduleSuccess, setScheduleSuccess] = useState('')


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
          const loadedAppearance = {
            ...DEFAULT_APPEARANCE,
            ...(data?.maintenance?.appearance ?? {}),
          }
          setAppearance(loadedAppearance)
          setSavedAppearance(loadedAppearance)
          const loadedEndAt = toLocalDateTimeValue(
            data?.maintenance?.endAt,
          )
          setEndAt(loadedEndAt)
          setSavedEndAt(loadedEndAt)
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


  async function saveAppearance(nextAppearance = appearance) {
    if (!token || appearanceSaving) return

    setAppearanceSaving(true)
    setError('')
    setAppearanceSuccess('')

    try {
      const data = await apiRequest('/admin/maintenance/appearance', {
        method: 'POST',
        token,
        body: { appearance: nextAppearance },
      })

      const saved = {
        ...DEFAULT_APPEARANCE,
        ...(data?.maintenance?.appearance ?? nextAppearance),
      }
      setAppearance(saved)
      setSavedAppearance(saved)
      setAppearanceSuccess('Maintenance appearance saved.')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save maintenance appearance.')
    } finally {
      setAppearanceSaving(false)
    }
  }

  async function saveSchedule() {
    if (!token || scheduleSaving) return

    if (endAt && new Date(endAt).getTime() <= Date.now()) {
      setError('Choose a future date and time for the maintenance end.')
      setScheduleSuccess('')
      return
    }

    setScheduleSaving(true)
    setError('')
    setScheduleSuccess('')

    try {
      const normalizedEndAt = endAt
        ? new Date(endAt).toISOString()
        : null

      const data = await apiRequest('/admin/maintenance/schedule', {
        method: 'POST',
        token,
        body: { endAt: normalizedEndAt },
      })

      const saved = toLocalDateTimeValue(data?.maintenance?.endAt ?? normalizedEndAt)
      setEndAt(saved)
      setSavedEndAt(saved)
      setScheduleSuccess(
        saved
          ? 'Maintenance end time scheduled successfully.'
          : 'Automatic end time cleared. Maintenance will stay active until manually disabled.',
      )
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save maintenance schedule.')
    } finally {
      setScheduleSaving(false)
    }
  }

  function resetAppearance() {
    setAppearance({ ...DEFAULT_APPEARANCE })
    setAppearanceSuccess('')
    setError('')
  }

  function cancelAppearanceChanges() {
    setAppearance({ ...savedAppearance })
    setAppearanceSuccess('')
    setError('')
  }

  function cancelScheduleChanges() {
    setEndAt(savedEndAt)
    setScheduleSuccess('')
    setError('')
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
    <AdminLayout>

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
                  placeholder="Example: We're currently performing scheduled maintenance"
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


              {/* APPEARANCE CUSTOMIZATION */}
              <section className="admin-maintenance-customization">
                <div className="admin-maintenance-section-heading">
                  <span className="admin-maintenance-label">Appearance</span>
                  <h3>Maintenance screen theme</h3>
                  <p>Choose a preset or customize individual colors. Changes are saved to the database.</p>
                </div>

                <div className="admin-maintenance-theme-presets">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className="admin-maintenance-theme-preset"
                      onClick={() => {
                        setAppearance({ ...preset.colors })
                        setAppearanceSuccess('')
                        setError('')
                      }}
                      aria-pressed={Object.keys(preset.colors).every(
                        (key) => appearance[key] === preset.colors[key],
                      )}
                    >
                      <span className="admin-maintenance-theme-swatches">
                        {[preset.colors.background, preset.colors.panel, preset.colors.accent].map((color) => (
                          <span key={color} style={{ backgroundColor: color }} />
                        ))}
                      </span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div
                  className="admin-maintenance-live-preview"
                  style={{
                    background: appearance.background,
                    color: appearance.text,
                    borderColor: appearance.border,
                  }}
                >
                  <div className="admin-maintenance-preview-panel" style={{ background: appearance.panel, borderColor: appearance.border }}>
                    <span style={{ color: appearance.accentHighlight, fontSize: 11, letterSpacing: '0.15em' }}>MARKETPLACE</span>
                    <h3 style={{ color: appearance.heading }}>Site is on maintenance</h3>
                    <p>We're working to bring the marketplace back online.</p>
                    <div className="admin-maintenance-preview-track" style={{ background: appearance.progressTrack }}>
                      <span style={{ background: appearance.progressFill, width: '68%' }} />
                    </div>
                    <button type="button" tabIndex={-1} style={{ background: appearance.buttonBackground, color: appearance.buttonText, border: 0, borderRadius: 6, padding: '8px 18px' }}>Login →</button>
                  </div>
                  <span className="admin-maintenance-preview-caption">Live preview · unsaved changes appear here</span>
                </div>

                <div className="admin-maintenance-color-grid">
                  {[
                    ['background', 'Page background'],
                    ['panel', 'Panel'],
                    ['border', 'Borders'],
                    ['accent', 'Accent'],
                    ['accentHighlight', 'Accent highlight'],
                    ['accentDark', 'Dark accent'],
                    ['heading', 'Heading text'],
                    ['text', 'Body text'],
                    ['muted', 'Muted text'],
                    ['buttonBackground', 'Login button'],
                    ['buttonText', 'Button text'],
                    ['progressTrack', 'Progress track'],
                    ['progressFill', 'Progress fill'],
                  ].map(([key, label]) => (
                    <label className="admin-maintenance-color-field" key={key}>
                      <span>{label}</span>
                      <span className="admin-maintenance-color-control">
                        <input
                          type="color"
                          value={appearance[key] || DEFAULT_APPEARANCE[key]}
                          onChange={(event) => {
                            setAppearance((current) => ({ ...current, [key]: event.target.value }))
                            setAppearanceSuccess('')
                          }}
                          aria-label={`${label} color`}
                        />
                        <input
                          type="text"
                          value={appearance[key] || DEFAULT_APPEARANCE[key]}
                          maxLength={7}
                          pattern="^#[0-9a-fA-F]{6}$"
                          onChange={(event) => {
                            const value = event.target.value
                            setAppearance((current) => ({ ...current, [key]: value }))
                            setAppearanceSuccess('')
                          }}
                          onBlur={() => {
                            if (!/^#[0-9a-fA-F]{6}$/.test(appearance[key] || '')) {
                              setAppearance((current) => ({ ...current, [key]: savedAppearance[key] || DEFAULT_APPEARANCE[key] }))
                            }
                          }}
                          aria-label={`${label} HEX value`}
                        />
                      </span>
                    </label>
                  ))}
                </div>

                <div className="admin-maintenance-customization-actions">
                  <button type="button" className="admin-secondary-button" onClick={cancelAppearanceChanges} disabled={appearanceSaving}>Cancel</button>
                  <button type="button" className="admin-secondary-button" onClick={resetAppearance} disabled={appearanceSaving}>Reset to default</button>
                  <button type="button" className="admin-maintenance-action enable" onClick={() => saveAppearance()} disabled={appearanceSaving || loading}>
                    {appearanceSaving ? 'Saving...' : 'Save Appearance'}
                  </button>
                </div>
                {appearanceSuccess ? <div className="admin-form-success" role="status">{appearanceSuccess}</div> : null}
              </section>

              {/* MAINTENANCE END-TIME SCHEDULE */}
              <section className="admin-maintenance-customization">
                <div className="admin-maintenance-section-heading">
                  <span className="admin-maintenance-label">Automatic scheduling</span>
                  <h3>Maintenance countdown</h3>
                  <p>Set the date and local time when maintenance should end. Leave it empty to require manual disabling.</p>
                </div>


<label className="admin-maintenance-schedule-field">
  <span>Scheduled end date and time</span>

  <input
    type="datetime-local"
    value={endAt}
    onChange={(event) => {
      setEndAt(event.target.value)
      setScheduleSuccess('')
      setError('')
    }}
  />
</label>


                <p className="admin-maintenance-schedule-note">
                  {endAt
                    ? `Scheduled for ${new Date(endAt).toLocaleString()} on this device. The backend will automatically turn maintenance off when this time passes.`
                    : 'No end time is set. The progress bar will remain nearly full and maintenance will stay active until you disable it.'}
                </p>

                <div className="admin-maintenance-customization-actions">
                  <button type="button" className="admin-secondary-button" onClick={cancelScheduleChanges} disabled={scheduleSaving}>Cancel</button>
                  <button type="button" className="admin-secondary-button" onClick={() => { setEndAt(''); setScheduleSuccess('') }} disabled={scheduleSaving}>Clear end time</button>
                  <button type="button" className="admin-maintenance-action enable" onClick={saveSchedule} disabled={scheduleSaving || loading}>
                    {scheduleSaving ? 'Saving...' : 'Save Schedule'}
                  </button>
                </div>
                {scheduleSuccess ? <div className="admin-form-success" role="status">{scheduleSuccess}</div> : null}
              </section>

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

    </AdminLayout>
  )
}
