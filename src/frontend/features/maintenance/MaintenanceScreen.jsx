import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './maintenance.css'

function renderMaintenanceMessage(message) {
  const parts = message.split(/(\*\*.*?\*\*)/g)

  return parts.map((part, index) => {
    if (
      part.startsWith('**') &&
      part.endsWith('**') &&
      part.length >= 4
    ) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    return <span key={index}>{part}</span>
  })
}

function formatRemainingTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value) => String(value).padStart(2, '0')

  if (days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function MaintenanceScreen({
  message = '',
  startedAt = null,
  endAt = null,
  appearance = {},
}) {
  const navigate = useNavigate()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const displayMessage =
    message.trim() ||
    "We're making a few improvements to the marketplace."

  const startTime = startedAt ? new Date(startedAt).getTime() : NaN
  const endTime = endAt ? new Date(endAt).getTime() : NaN

  const hasValidSchedule =
    Number.isFinite(startTime) &&
    Number.isFinite(endTime) &&
    endTime > startTime

  const hasEndTime = Number.isFinite(endTime) && endTime > 0
  const remainingMilliseconds = hasEndTime
    ? Math.max(0, endTime - now)
    : null

  // Shrinks from 100% to 0% over the scheduled maintenance window.
  // If the API has an end time but no valid start time, show remaining
  // time against the current time as a fallback instead of a fixed 97%.
  const progress = hasValidSchedule
    ? Math.min(
        100,
        Math.max(0, ((endTime - now) / (endTime - startTime)) * 100),
      )
    : hasEndTime
      ? Math.min(100, Math.max(0, (remainingMilliseconds / (24 * 60 * 60 * 1000)) * 100))
      : 97

  const themeStyle = {
    '--maintenance-background': appearance.background || '#1a1a1a',
    '--maintenance-panel': appearance.panel || '#2d2d2d',
    '--maintenance-border': appearance.border || '#4a4a4a',
    '--maintenance-accent': appearance.accent || '#e85d3a',
    '--maintenance-highlight': appearance.accentHighlight || '#f07b4f',
    '--maintenance-accent-dark': appearance.accentDark || '#c24826',
    '--maintenance-heading': appearance.heading || '#f5f5f5',
    '--maintenance-text': appearance.text || '#e5e5e5',
    '--maintenance-muted': appearance.muted || '#a3a3a3',
    '--maintenance-button-background': appearance.buttonBackground || '#e85d3a',
    '--maintenance-button-text': appearance.buttonText || '#ffffff',
    '--maintenance-progress-track': appearance.progressTrack || '#4a4a4a',
    '--maintenance-progress-fill': appearance.progressFill || '#e85d3a',
  }

  return (
    <main className="maintenance-screen" style={themeStyle}>
      <div className="maintenance-card">
        <div className="maintenance-clock" aria-hidden="true">
          <span className="maintenance-clock-hand maintenance-clock-hour" />
          <span className="maintenance-clock-hand maintenance-clock-minute" />
          <span className="maintenance-clock-hand maintenance-clock-second" />
          <span className="maintenance-clock-center" />
        </div>

        <span className="maintenance-eyebrow">MARKETPLACE</span>
        <h1>Site is on maintenance</h1>

        <p className="maintenance-message">
          {renderMaintenanceMessage(displayMessage)}
        </p>

        <p className="maintenance-submessage">
          We're working to bring the marketplace back online.
        </p>

        <section className="maintenance-countdown" aria-label="Maintenance countdown">
          <div className="maintenance-countdown-header">
            <span>{hasEndTime ? 'TIME REMAINING' : 'SYSTEM STATUS'}</span>
            <strong>
              {hasEndTime
                ? formatRemainingTime(remainingMilliseconds)
                : 'IN PROGRESS'}
            </strong>
          </div>

          <div
            className="maintenance-progress-track"
            role="progressbar"
            aria-label="Time remaining until maintenance ends"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="maintenance-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="maintenance-progress-labels">
            <span>
              {hasValidSchedule ? 'Scheduled maintenance' : 'Maintenance active'}
            </span>
            <span>
              {hasValidSchedule
                ? `${Math.round(progress)}% time remaining`
                : hasEndTime
                  ? `${Math.round(progress)}% estimated time remaining`
                  : 'Until manually disabled'}
            </span>
          </div>
        </section>

        <button
          type="button"
          className="maintenance-login-button"
          onClick={() => navigate('/login')}
        >
          Login <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  )
}
