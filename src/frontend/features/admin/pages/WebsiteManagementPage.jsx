import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdminSidebar } from '../components/AdminSidebar.jsx'
import { AdminTopbar } from '../components/AdminTopbar.jsx'

import '../admin.css'
import './website-management.css'


function WebsiteManagementPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] =
    useState(false)


  const sections = [
    {
      title: 'Homepage',
      description:
        'Manage homepage content and sections.',
      path:
        '/admin/website-management/homepage',
      icon: '⌂',
      status: 'Active',
      tone: 'teal',
    },

    {
      title: 'Banners',
      description:
        'Manage promotional website banners.',
      path:
        '/admin/website-management/banners',
      icon: '▧',
      status: '4 Active',
      tone: 'blue',
    },

    {
      title: 'Website Settings',
      description:
        'Manage general website settings and preferences.',
      path:
        '/admin/website-management/settings',
      icon: '⚙',
      status: 'Configured',
      tone: 'purple',
    },
  ]


  return (
    <div className="admin-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <AdminSidebar
        isOpen={sidebarOpen}
        onNavigate={() =>
          setSidebarOpen(false)
        }
      />


      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay visible"
          type="button"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="admin-main">

        <AdminTopbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />


        <main className="admin-content">

          {/* =================================================
              BACK
          ================================================= */}

          <button
            type="button"
            className="admin-website-back-button"
            onClick={() =>
              navigate('/admin/dashboard')
            }
          >
            <span aria-hidden="true">
              ←
            </span>

            Back to Dashboard
          </button>


          {/* =================================================
              HERO
          ================================================= */}

          <section className="admin-website-hero">

            <div className="admin-website-hero-copy">

              <span className="admin-eyebrow">
                Website
              </span>

              <h1>
                Website Management
              </h1>

              <p>
                Manage your marketplace website
                content and settings.
              </p>

            </div>


            {/* =================================================
                WEBSITE ILLUSTRATION
            ================================================= */}

            <div
              className="admin-website-hero-illustration"
              aria-hidden="true"
            >

              <div className="admin-website-browser">

                <div className="admin-website-browser-top">

                  <span />
                  <span />
                  <span />

                  <i />

                </div>


                <div className="admin-website-browser-body">

                  <div className="admin-browser-block large" />

                  <div className="admin-browser-lines">

                    <span />
                    <span />

                  </div>


                  <div className="admin-browser-row">

                    <div />
                    <div />
                    <div />

                  </div>

                </div>

              </div>


              <div className="admin-website-gear">
                ⚙
              </div>


              <div className="admin-website-leaf leaf-one" />
              <div className="admin-website-leaf leaf-two" />
              <div className="admin-website-leaf leaf-three" />

            </div>

          </section>


          {/* =================================================
              MANAGEMENT CARDS
          ================================================= */}

          <section className="admin-website-management-grid">

            {sections.map((section) => (

              <button
                key={section.path}
                type="button"
                className={`admin-website-management-card ${section.tone}`}
                onClick={() =>
                  navigate(section.path)
                }
              >

                <div className="admin-website-card-top">

                  <span className="admin-website-card-icon">
                    {section.icon}
                  </span>


                  <span className="admin-website-status">
                    {section.status}
                  </span>

                </div>


                <div className="admin-website-card-content">

                  <h2>
                    {section.title}
                  </h2>

                  <p>
                    {section.description}
                  </p>

                </div>


                <span className="admin-website-card-action">
                  Manage

                  <span aria-hidden="true">
                    →
                  </span>
                </span>

              </button>

            ))}

          </section>


          {/* =================================================
              WEBSITE OVERVIEW
          ================================================= */}

          <section className="admin-website-overview">

            <div className="admin-website-overview-heading">

              <span className="admin-panel-eyebrow">
                Website Overview
              </span>

            </div>


            <div className="admin-website-overview-grid">

              {/* =================================================
                  HOMEPAGE STATUS
              ================================================= */}

              <div className="admin-website-overview-item">

                <div className="admin-website-overview-icon teal">
                  ⌂
                </div>


                <div>

                  <span>
                    Homepage Status
                  </span>

                  <strong className="teal-text">
                    Active
                  </strong>

                  <p>
                    Your homepage is live and
                    visible to users.
                  </p>

                </div>

              </div>


              {/* =================================================
                  ACTIVE BANNERS
              ================================================= */}

              <div className="admin-website-overview-item">

                <div className="admin-website-overview-icon blue">
                  ▧
                </div>


                <div>

                  <span>
                    Active Banners
                  </span>

                  <strong className="blue-text">
                    4 Active
                  </strong>

                  <p>
                    4 promotional banners are
                    currently active.
                  </p>

                </div>

              </div>


              {/* =================================================
                  WEBSITE STATUS
              ================================================= */}

              <div className="admin-website-overview-item">

                <div className="admin-website-overview-icon purple">
                  ◎
                </div>


                <div>

                  <span>
                    Website Status
                  </span>

                  <strong className="purple-text">
                    Published
                  </strong>

                  <p>
                    Your website is published and
                    accessible to everyone.
                  </p>

                </div>

              </div>


              {/* =================================================
                  STATUS ILLUSTRATION
              ================================================= */}

              <div
                className="admin-website-status-illustration"
                aria-hidden="true"
              >

                <div className="admin-status-monitor">

                  <div className="admin-status-check">
                    ✓
                  </div>

                </div>

                <div className="admin-status-monitor-base" />

              </div>

            </div>

          </section>


          {/* =================================================
              INFO BANNER
          ================================================= */}

          <div className="admin-website-info-banner">

            <span className="admin-website-info-icon">
              i
            </span>

            <p>
              Keep your website content updated to
              provide the best experience for your users.
            </p>

          </div>

        </main>

      </div>

    </div>
  )
}


export default WebsiteManagementPage