import { NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth.js'


const navigation = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
  },

  {
    label: 'Website Management',
    path: '/admin/website-management',
  },

  {
    label: 'Orders',
    path: '/admin/orders',
  },

  {
    label: 'Messages',
    path: '/admin/chat',
  },

  {
    label: 'Payouts',
    path: '/admin/payouts',
  },

  {
    label: 'Products',
    path: '/admin/products',
  },
]


export function AdminSidebar({
  isOpen,
  onNavigate,
}) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()


  async function handleLogout() {
    await logout()

    if (onNavigate) {
      onNavigate()
    }

    navigate('/login')
  }


  const adminName =
    user?.fullName ||
    user?.name ||
    'Administrator'


  return (
    <aside
      className={
        isOpen
          ? 'admin-sidebar open'
          : 'admin-sidebar'
      }
    >

      <div className="admin-brand">

        <div className="admin-brand-mark">
          M
        </div>

        <div>

          <strong>
            Marketplace
          </strong>

          <span>
            Admin
          </span>

        </div>

      </div>


      <nav className="admin-navigation">

        <p className="admin-nav-label">
          Workspace
        </p>


        {navigation.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `admin-nav-link ${
                isActive ? 'active' : ''
              }`
            }
          >

            <span className="admin-nav-icon">
              {item.label.charAt(0)}
            </span>

            <span>
              {item.label}
            </span>

          </NavLink>

        ))}

      </nav>


      <div className="admin-sidebar-bottom">

        <button
          type="button"
          className="admin-nav-link admin-logout-button"
          onClick={handleLogout}
        >

          <span className="admin-nav-icon">
            ↪
          </span>

          <span>
            Logout
          </span>

        </button>


        <div className="admin-sidebar-user">

          <div className="admin-avatar">
            {adminName.charAt(0).toUpperCase()}
          </div>

          <div>

            <strong>
              {adminName}
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </div>

      </div>

    </aside>
  )
}