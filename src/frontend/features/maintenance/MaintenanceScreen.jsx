import { useNavigate } from 'react-router-dom'

import './maintenance.css'

export function MaintenanceScreen() {
  const navigate = useNavigate()

  return (
    <main className="maintenance-screen">
      <div className="maintenance-card">
        <div
          className="maintenance-clock"
          aria-hidden="true"
        >
          <span className="maintenance-clock-hand maintenance-clock-hour" />
          <span className="maintenance-clock-hand maintenance-clock-minute" />
          <span className="maintenance-clock-hand maintenance-clock-second" />
          <span className="maintenance-clock-center" />
        </div>

        <span className="maintenance-eyebrow">
          Marketplace
        </span>

        <h1>
          Site is on maintenance
        </h1>

        <p className="maintenance-message">
          We're making a few improvements to the
          marketplace.
        </p>

        <p className="maintenance-submessage">
          Try again sometime.
        </p>

        <button
          type="button"
          className="maintenance-login-button"
          onClick={() => navigate('/login')}
        >
          Login
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  )
}