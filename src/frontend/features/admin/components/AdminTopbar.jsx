import { useAuth } from '../../auth/useAuth.js'

export function AdminTopbar({ onMenuClick }) {
  const auth = useAuth()

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          className="admin-menu-button"
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div>
          <p>Admin Panel</p>
          <h2>Overview</h2>
        </div>
      </div>

      <div className="admin-topbar-right">
        <button className="admin-icon-button" type="button">
          ♧
        </button>

        <div className="admin-profile">
          <div className="admin-avatar">
            {auth.user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>

          <div>
            <strong>{auth.user?.name || 'Administrator'}</strong>
            <span>Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}