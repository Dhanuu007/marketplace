
import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar.jsx'
import { AdminTopbar } from './AdminTopbar.jsx'
import '../admin.css'

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          {children}
        </main>
      </div>
    </div>
  )
}
