import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'

import './BuyerDashboardPage.css'


export function BuyerDashboardPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const isSuspended =
    auth.user?.suspended === true


  async function handleLogout() {
    const confirmed = window.confirm(
      'Are you sure you want to logout?',
    )

    if (!confirmed) {
      return
    }

    navigate('/', {
      replace: true,
    })

    await auth.logout()
  }


  return (
    <main className="buyer-dashboard-shell">

      <section className="buyer-dashboard-container">


        {/* =====================================================
            SUSPENDED ACCOUNT WARNING
        ===================================================== */}

        {isSuspended && (
          <section
            className="buyer-suspension-banner"
            role="alert"
            aria-live="polite"
          >

            <div className="buyer-suspension-icon">
              !
            </div>


            <div className="buyer-suspension-content">

              <p className="buyer-suspension-eyebrow">
                Account Security
              </p>


              <h2>
                Account Suspended
              </h2>


              <p className="buyer-suspension-message">
                Your Buyer account has been suspended
                and marketplace actions are temporarily
                unavailable.
              </p>


              <div className="buyer-suspension-reason">

                <span>
                  Suspension reason
                </span>

                <strong>
                  {auth.user?.suspensionReason ||
                    'No specific reason was provided.'}
                </strong>

              </div>


              <p className="buyer-suspension-contact">
                Please contact the administrator to
                resolve this issue and request further
                assistance.
              </p>

              <button
                  type="button"
                  className="buyer-suspension-contact-button"
                  onClick={() =>
                    navigate('/buyer/suspension-support')
                  }
                >
                  Contact Admin
                  <span>→</span>
               </button>

            </div>

          </section>
        )}


        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="buyer-dashboard-header">

          <div className="buyer-dashboard-header-content">

            <p className="buyer-eyebrow">
              Website Buyer
            </p>


            <h1>
              Buyer Dashboard
            </h1>


            <p className="buyer-welcome">
              Welcome back,{' '}
              <strong>
                {auth.user?.name || 'Buyer'}
              </strong>
              .
              <br />

              <span>
                Discover websites, manage your purchases,
                and track your marketplace orders.
              </span>
            </p>

          </div>


          <div className="buyer-dashboard-actions">

            {/* =================================================
                BLOCKED ACTIONS
            ================================================= */}

            <div
              className={
                isSuspended
                  ? 'buyer-dashboard-actions-blocked'
                  : ''
              }
              aria-hidden={isSuspended}
            >

              <Link
                to="/products"
                className="buyer-primary-button"
              >
                Browse Websites
                <span>→</span>
              </Link>


              <Link
                to="/account"
                className="buyer-secondary-button"
              >
                My Account
                <span>→</span>
              </Link>

            </div>


            {/* =================================================
                LOGOUT — ALWAYS AVAILABLE
            ================================================= */}

            <button
              type="button"
              className="buyer-logout-button"
              onClick={handleLogout}
            >
              Logout
              <span>↪</span>
            </button>

          </div>

        </header>


        {/* =====================================================
            DASHBOARD CONTENT
        ===================================================== */}

        <div
          className={
            isSuspended
              ? 'buyer-dashboard-content buyer-dashboard-content-suspended'
              : 'buyer-dashboard-content'
          }
          aria-hidden={isSuspended}
        >


          {/* ===================================================
              QUICK ACTIONS
          =================================================== */}

          <section className="buyer-dashboard-section">

            <div className="buyer-section-heading">

              <div>

                <p className="buyer-eyebrow">
                  Marketplace
                </p>


                <h2>
                  What would you like to do?
                </h2>


                <p>
                  Quickly access the most important
                  Buyer marketplace features.
                </p>

              </div>

            </div>


            <div className="buyer-action-grid">


              {/* Browse */}

              <Link
                to="/products"
                className="buyer-action-card"
              >

                <div className="buyer-action-icon">
                  ◫
                </div>


                <div>

                  <h3>
                    Browse Websites
                  </h3>


                  <p>
                    Explore websites available for
                    purchase in the marketplace.
                  </p>

                </div>


                <span className="buyer-action-arrow">
                  →
                </span>

              </Link>


              {/* Orders */}

              <Link
                to="/buyer/orders"
                className="buyer-action-card"
              >

                <div className="buyer-action-icon">
                  #
                </div>


                <div>

                  <h3>
                    My Orders
                  </h3>


                  <p>
                    View your website purchases and
                    order status.
                  </p>

                </div>


                <span className="buyer-action-arrow">
                  →
                </span>

              </Link>


              {/* Messages */}

              <Link
                to="/buyer/chat"
                className="buyer-action-card"
              >

                <div className="buyer-action-icon">
                  💬
                </div>


                <div>

                  <h3>
                    Messages
                  </h3>


                  <p>
                    Chat with creators about your
                    purchased websites.
                  </p>

                </div>


                <span className="buyer-action-arrow">
                  →
                </span>

              </Link>


              {/* Account */}

              <Link
                to="/account"
                className="buyer-action-card"
              >

                <div className="buyer-action-icon">
                  ◉
                </div>


                <div>

                  <h3>
                    My Account
                  </h3>


                  <p>
                    Manage your account information
                    and profile.
                  </p>

                </div>


                <span className="buyer-action-arrow">
                  →
                </span>

              </Link>

            </div>

          </section>


          {/* ===================================================
              BUYER INFORMATION
          =================================================== */}

          <section className="buyer-info-card">

            <div>

              <p className="buyer-eyebrow">
                Your Marketplace Account
              </p>


              <h2>
                Ready to find your next website?
              </h2>


              <p>
                Browse professionally created websites,
                choose the one you like, and purchase it
                securely through the marketplace.
              </p>

            </div>


            <Link
              to="/products"
              className="buyer-info-button"
            >
              Explore Marketplace
              <span>→</span>
            </Link>

          </section>

        </div>

      </section>

    </main>
  )
}