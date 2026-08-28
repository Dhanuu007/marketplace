import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreatorDashboardScene } from './CreatorDashboardScene.jsx'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { env } from '../../config/env.js'

import './CreatorDashboardPage.css'


const API_ORIGIN =
  env.apiBaseUrl.replace(/\/api\/?$/, '')


export function CreatorDashboardPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [notifications, setNotifications] = useState([])
  const [notificationUnreadCount, setNotificationUnreadCount] =
    useState(0)

  const [notificationsLoading, setNotificationsLoading] =
    useState(false)

  const [notificationsOpen, setNotificationsOpen] =
    useState(false)

  const [notificationError, setNotificationError] =
    useState('')


  // =========================================================
  // LOAD CREATOR LISTINGS
  // =========================================================

  useEffect(() => {
    async function loadCreatorProducts() {
      if (!auth.token) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        setError('')

        const data = await apiRequest('/products/creator', {
          method: 'GET',
          token: auth.token,
        })

        setProducts(
          Array.isArray(data?.products)
            ? data.products
            : [],
        )
      } catch (error) {
        setError(
          error?.message ||
            'Unable to load your website listings.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadCreatorProducts()
  }, [auth.token])


  // =========================================================
  // LOAD CREATOR ORDERS
  // =========================================================

  useEffect(() => {
    async function loadCreatorOrders() {
      if (!auth.token) {
        setOrders([])
        setOrdersLoading(false)
        setOrdersError('Authentication is required.')
        return
      }

      try {
        setOrdersLoading(true)
        setOrdersError('')

        const data = await apiRequest(
          '/creator/orders',
          {
            method: 'GET',
            token: auth.token,
          },
        )

        setOrders(
          Array.isArray(data?.orders)
            ? data.orders
            : [],
        )
      } catch (error) {
        setOrdersError(
          error?.message ||
            'Unable to load your website orders.',
        )
      } finally {
        setOrdersLoading(false)
      }
    }

    loadCreatorOrders()
  }, [auth.token])


  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

    // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    if (!auth.token) {
      return undefined
    }

    let cancelled = false


    async function fetchNotifications({
      showLoading = true,
    } = {}) {
      try {
        if (showLoading) {
          setNotificationsLoading(true)
        }

        setNotificationError('')

        const [
          notificationsData,
          unreadData,
        ] = await Promise.all([
          apiRequest('/notifications', {
            method: 'GET',
            token: auth.token,
          }),

          apiRequest('/notifications/unread-count', {
            method: 'GET',
            token: auth.token,
          }),
        ])


        if (cancelled) {
          return
        }


        setNotifications(
          Array.isArray(
            notificationsData?.notifications,
          )
            ? notificationsData.notifications
            : [],
        )


        setNotificationUnreadCount(
          Number(unreadData?.count || 0),
        )
      } catch (error) {
        if (cancelled) {
          return
        }

        setNotificationError(
          error?.message ||
            'Unable to load notifications.',
        )
      } finally {
        if (!cancelled && showLoading) {
          setNotificationsLoading(false)
        }
      }
    }


    const timeout = window.setTimeout(() => {
      fetchNotifications()
    }, 0)


    const interval = window.setInterval(() => {
      fetchNotifications({
        showLoading: false,
      })
    }, 30000)


    return () => {
      cancelled = true

      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [auth.token])


  // =========================================================
  // LISTING STATISTICS
  // =========================================================

  const pendingCount = products.filter(
    (product) =>
      product.approvalStatus === 'PENDING',
  ).length


  const approvedCount = products.filter(
    (product) =>
      product.approvalStatus === 'APPROVED',
  ).length


  const rejectedCount = products.filter(
    (product) =>
      product.approvalStatus === 'REJECTED',
  ).length


  // =========================================================
  // ORDER STATISTICS
  // =========================================================

  const totalSales = orders.reduce(
    (total, order) =>
      total + Number(order.totalAmount || 0),
    0,
  )


  const pendingDeliveryCount = orders.reduce(
    (total, order) =>
      total +
      (order.items ?? []).filter(
        (item) =>
          item.delivery?.status !== 'DELIVERED',
      ).length,
    0,
  )


  const deliveredCount = orders.reduce(
    (total, order) =>
      total +
      (order.items ?? []).filter(
        (item) =>
          item.delivery?.status === 'DELIVERED',
      ).length,
    0,
  )


  // =========================================================
  // HELPERS
  // =========================================================

  function formatCurrency(value) {
    return `₹${Number(
      value || 0,
    ).toLocaleString('en-IN')}`
  }


  function formatDate(value) {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleDateString('en-IN')
  }


  function formatNotificationDate(value) {
    if (!value) {
      return ''
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    })
  }


  function getStatusClass(status) {
    return `creator-status creator-status-${String(
      status || 'PENDING',
    ).toLowerCase()}`
  }


  function getScreenshotUrl(path) {
    if (!path) {
      return ''
    }

    if (
      path.startsWith('http://') ||
      path.startsWith('https://')
    ) {
      return path
    }

    return `${API_ORIGIN}${path}`
  }


  // =========================================================
  // NOTIFICATION ACTIONS
  // =========================================================

  async function handleNotificationClick(
    notification,
  ) {
    if (!notification?.id) {
      return
    }

    try {
      if (!notification.read) {
        await apiRequest(
          `/notifications/${notification.id}/read`,
          {
            method: 'PATCH',
            token: auth.token,
          },
        )

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read: true,
                }
              : item,
          ),
        )

        setNotificationUnreadCount((count) =>
          Math.max(0, count - 1),
        )
      }
    } catch {
      // Keep navigation working even if
      // marking the notification fails.
    }

    setNotificationsOpen(false)

    if (
      notification.relatedType ===
        'CONVERSATION' &&
      notification.relatedId
    ) {
      navigate('/creator/chat', {
        state: {
          conversationId:
            notification.relatedId,
        },
      })

      return
    }
  }


  async function handleMarkAllNotificationsRead() {
    if (
      !auth.token ||
      notificationUnreadCount === 0
    ) {
      return
    }

    try {
      await apiRequest(
        '/notifications/read-all',
        {
          method: 'PATCH',
          token: auth.token,
        },
      )

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        })),
      )

      setNotificationUnreadCount(0)
    } catch (error) {
      setNotificationError(
        error?.message ||
          'Unable to mark notifications as read.',
      )
    }
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  async function handleLogout() {
    const confirmed = window.confirm(
      'Are you sure you want to logout?',
    )

    if (!confirmed) {
      return
    }

    await auth.logout()
  }


  return (
    <main className="creator-shell">

      <section className="creator-container">

        {/* =================================================
            DASHBOARD HEADER
        ================================================= */}

        <header className="creator-header">

          <CreatorDashboardScene />

          <div className="creator-header-main">

            <div className="creator-header-eyebrow">

              <span className="creator-eyebrow-dot" />

              Website Creator

            </div>


            <h1>
              Creator Dashboard
            </h1>


            <p className="creator-welcome">

              Welcome back,{' '}

              <strong>
                {auth.user?.name || 'Creator'}
              </strong>

              .

              <br />

              <span>
                Manage your website listings and
                marketplace activity from one place.
              </span>

            </p>


            <div className="creator-id">

              <span>
                Creator ID
              </span>

              <strong>
                {auth.user?.id || 'ID not available'}
              </strong>

            </div>

          </div>


          <div className="creator-header-actions">

            {/* =================================================
                EARNINGS & PAYOUTS
            ================================================= */}

            <Link
              to="/creator/finances"
              className="creator-earnings-button"
            >

              <span>
                Earnings & Payouts
              </span>

              <span className="creator-button-arrow">
                →
              </span>

            </Link>


            {/* =================================================
                ORDERS
            ================================================= */}

            <Link
              to="/creator/orders"
              className="creator-orders-button"
            >

              <span>
                Orders
              </span>

              <span className="creator-button-arrow">
                →
              </span>

            </Link>


            {/* =================================================
                MESSAGES
            ================================================= */}

            <Link
              to="/creator/chat"
              className="creator-orders-button"
            >

              <span>
                Messages
              </span>

              <span className="creator-button-arrow">
                →
              </span>

            </Link>


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div className="creator-notification-wrapper">

              <button
                type="button"
                className="creator-notification-button"
                onClick={() =>
                  setNotificationsOpen(
                    (open) => !open,
                  )
                }
                aria-label="Open notifications"
                aria-expanded={
                  notificationsOpen
                }
              >

                <span className="creator-notification-icon">
                  ♧
                </span>

                <span>
                  Notifications
                </span>

                {notificationUnreadCount > 0 && (

                  <span className="creator-notification-badge">

                    {notificationUnreadCount > 99
                      ? '99+'
                      : notificationUnreadCount}

                  </span>

                )}

              </button>


              {notificationsOpen && (

                <div className="creator-notification-panel">

                  <div className="creator-notification-header">

                    <div>

                      <strong>
                        Notifications
                      </strong>

                      <span>
                        {notificationUnreadCount > 0
                          ? `${notificationUnreadCount} unread`
                          : 'All caught up'}
                      </span>

                    </div>


                    {notificationUnreadCount > 0 && (

                      <button
                        type="button"
                        className="creator-notification-read-all"
                        onClick={
                          handleMarkAllNotificationsRead
                        }
                      >
                        Mark all read
                      </button>

                    )}

                  </div>


                  {notificationError && (

                    <div className="creator-notification-error">
                      {notificationError}
                    </div>

                  )}


                  {notificationsLoading && (

                    <div className="creator-notification-empty">

                      <div className="creator-loading-spinner" />

                      <span>
                        Loading notifications...
                      </span>

                    </div>

                  )}


                  {!notificationsLoading &&
                    notifications.length === 0 && (

                      <div className="creator-notification-empty">

                        <div className="creator-notification-empty-icon">
                          ✓
                        </div>

                        <strong>
                          No notifications
                        </strong>

                        <span>
                          You're all caught up.
                        </span>

                      </div>

                    )}


                  {!notificationsLoading &&
                    notifications.length > 0 && (

                      <div className="creator-notification-list">

                        {notifications.map(
                          (notification) => (

                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              className={`creator-notification-item ${
                                notification.read
                                  ? ''
                                  : 'creator-notification-item-unread'
                              }`}
                              onClick={() =>
                                handleNotificationClick(
                                  notification,
                                )
                              }
                            >

                              <span className="creator-notification-item-icon">
                                {notification.type ===
                                'NEW_MESSAGE'
                                  ? '✉'
                                  : '•'}
                              </span>


                              <span className="creator-notification-item-content">

                                <strong>
                                  {
                                    notification.title
                                  }
                                </strong>

                                <span>
                                  {
                                    notification.message
                                  }
                                </span>

                                <small>
                                  {formatNotificationDate(
                                    notification.createdAt,
                                  )}
                                </small>

                              </span>


                              {!notification.read && (

                                <span className="creator-notification-unread-dot" />

                              )}

                            </button>

                          ),
                        )}

                      </div>

                    )}

                </div>

              )}

            </div>


            {/* =================================================
                PAYMENT SETTINGS
            ================================================= */}

            <Link
              to="/creator/payment-settings"
              className="creator-payment-settings-button"
            >

              <span>
                Manual Payout Details
              </span>

              <span className="creator-button-arrow">
                →
              </span>

            </Link>


            {/* =================================================
                AUTOMATED PAYOUTS
            ================================================= */}

            <Link
              to="/creator/automated-payouts"
              className="creator-automated-payouts-button"
            >

              <span>
                Automated Payouts
              </span>

              <span className="creator-button-arrow">
                →
              </span>

            </Link>


            {/* =================================================
                ADD LISTING
            ================================================= */}

            <Link
              to="/creator/listings/new"
              className="creator-primary-button"
            >

              <span className="creator-plus">
                +
              </span>

              Add Website Listing

            </Link>


            {/* =================================================
                LOGOUT
            ================================================= */}

            <button
              type="button"
              className="creator-logout-button"
              onClick={handleLogout}
            >

              <span>
                Logout
              </span>

              <span className="creator-button-arrow">
                ↪
              </span>

            </button>

          </div>

        </header>


        {/* =================================================
            QUICK OVERVIEW
        ================================================= */}

        <section className="creator-overview">

          <div className="creator-overview-copy">

            <p className="eyebrow">
              Marketplace Overview
            </p>

            <h2>
              Your selling activity
            </h2>

            <p>
              Track your listings, orders, sales,
              and delivery activity at a glance.
            </p>

          </div>

        </section>


        {/* =================================================
            LISTING STAT CARDS
        ================================================= */}

        <section className="creator-stats">

          {/* Total Listings */}

          <article className="creator-stat-card creator-stat-total">

            <div className="creator-stat-top">

              <span>
                Total Listings
              </span>

              <div className="creator-stat-icon">
                ◫
              </div>

            </div>

            <strong>
              {products.length}
            </strong>

            <small>
              Websites submitted
            </small>

          </article>


          {/* Pending Review */}

          <article className="creator-stat-card creator-stat-pending">

            <div className="creator-stat-top">

              <span>
                Pending Review
              </span>

              <div className="creator-stat-icon">
                ◷
              </div>

            </div>

            <strong>
              {pendingCount}
            </strong>

            <small>
              Awaiting admin approval
            </small>

          </article>


          {/* Approved */}

          <article className="creator-stat-card creator-stat-approved">

            <div className="creator-stat-top">

              <span>
                Approved
              </span>

              <div className="creator-stat-icon">
                ✓
              </div>

            </div>

            <strong>
              {approvedCount}
            </strong>

            <small>
              Live-ready listings
            </small>

          </article>


          {/* Rejected */}

          <article className="creator-stat-card creator-stat-rejected">

            <div className="creator-stat-top">

              <span>
                Rejected
              </span>

              <div className="creator-stat-icon">
                !
              </div>

            </div>

            <strong>
              {rejectedCount}
            </strong>

            <small>
              Listings needing attention
            </small>

          </article>

        </section>


        {/* =================================================
            SALES & ORDER OVERVIEW
        ================================================= */}

        <section className="creator-sales-overview">

          <div className="creator-overview-copy">

            <p className="eyebrow">
              Website Sales
            </p>

            <h2>
              Your marketplace performance
            </h2>

            <p>
              Track purchases, delivery progress,
              and total creator sales.
            </p>

          </div>


          {ordersError && !ordersLoading && (

            <div className="creator-orders-mini-error">
              Unable to load order statistics.
            </div>

          )}

        </section>


        {/* =================================================
            SALES STAT CARDS
        ================================================= */}

        <section className="creator-stats creator-sales-stats">

          {/* Website Orders */}

          <article className="creator-stat-card creator-stat-total">

            <div className="creator-stat-top">

              <span>
                Website Orders
              </span>

              <div className="creator-stat-icon">
                #
              </div>

            </div>

            <strong>
              {ordersLoading
                ? '—'
                : orders.length}
            </strong>

            <small>
              Total marketplace orders
            </small>

          </article>


          {/* Pending Delivery */}

          <article className="creator-stat-card creator-stat-pending">

            <div className="creator-stat-top">

              <span>
                Pending Delivery
              </span>

              <div className="creator-stat-icon">
                ◷
              </div>

            </div>

            <strong>
              {ordersLoading
                ? '—'
                : pendingDeliveryCount}
            </strong>

            <small>
              Websites awaiting delivery
            </small>

          </article>


          {/* Creator Sales */}

          <article className="creator-stat-card creator-stat-approved">

            <div className="creator-stat-top">

              <span>
                Creator Sales
              </span>

              <div className="creator-stat-icon">
                ₹
              </div>

            </div>

            <strong>
              {ordersLoading
                ? '—'
                : formatCurrency(totalSales)}
            </strong>

            <small>
              Total order value
            </small>

          </article>


          {/* Delivered */}

          <article className="creator-stat-card creator-stat-rejected">

            <div className="creator-stat-top">

              <span>
                Delivered
              </span>

              <div className="creator-stat-icon">
                ✓
              </div>

            </div>

            <strong>
              {ordersLoading
                ? '—'
                : deliveredCount}
            </strong>

            <small>
              Website deliveries completed
            </small>

          </article>

        </section>


        {/* =================================================
            LISTINGS SECTION
        ================================================= */}

        <section className="creator-listings-section">

          <div className="creator-section-heading">

            <div>

              <p className="eyebrow">
                Your Marketplace
              </p>

              <h2>
                My Website Listings
              </h2>

              <p className="creator-section-description">
                Manage your website listings, previews,
                pricing, and approval status.
              </p>

            </div>


            <div className="creator-section-heading-right">

              <span className="creator-count">

                {products.length}{' '}

                {products.length === 1
                  ? 'listing'
                  : 'listings'}

              </span>


              <Link
                to="/creator/listings/new"
                className="creator-section-add"
              >
                + Add Listing
              </Link>

            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="creator-message">

              <div className="creator-loading-spinner" />

              <div>

                <strong>
                  Loading your listings
                </strong>

                <span>
                  Please wait while we fetch your
                  marketplace websites.
                </span>

              </div>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (

            <div className="creator-error">

              <div className="creator-error-icon">
                !
              </div>

              <div>

                <strong>
                  Unable to load listings
                </strong>

                <span>
                  {error}
                </span>

              </div>

            </div>

          )}


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!loading &&
            !error &&
            products.length === 0 && (

              <div className="creator-empty">

                <div className="creator-empty-icon">
                  +
                </div>

                <p className="eyebrow">
                  Start Selling
                </p>

                <h3>
                  No website listings yet
                </h3>

                <p>
                  You haven't submitted a website for
                  sale yet. Add your first website and
                  start building your marketplace
                  portfolio.
                </p>

                <Link
                  to="/creator/listings/new"
                  className="creator-primary-button"
                >
                  Add Your First Website
                </Link>

              </div>

            )}


          {/* =================================================
              LISTINGS
          ================================================= */}

          {!loading &&
            !error &&
            products.length > 0 && (

              <div className="creator-listings">

                {products.map((product) => {

                  const hasScreenshot =
                    Array.isArray(product.screenshots) &&
                    product.screenshots.length > 0

                  const previewImage =
                    product.image ||
                    (hasScreenshot
                      ? product.screenshots[0]
                      : '')

                  return (
                    <article
                      key={product._id}
                      className="creator-listing-card"
                    >

                      {/* =======================================
                          WEBSITE PREVIEW
                      ======================================= */}

                      <div className="creator-listing-visual">

                        <div className="creator-listing-image">

                          {previewImage ? (

                            <img
                              src={getScreenshotUrl(
                                previewImage,
                              )}
                              alt={product.name}
                            />

                          ) : (

                            <div className="creator-image-placeholder">

                              <span>
                                WEBSITE
                              </span>

                              <small>
                                No preview image
                              </small>

                            </div>

                          )}

                        </div>


                        <div className="creator-image-overlay">

                          <span>
                            Website Listing
                          </span>

                        </div>

                      </div>


                      {/* =======================================
                          LISTING CONTENT
                      ======================================= */}

                      <div className="creator-listing-content">

                        <div className="creator-listing-top">

                          <div className="creator-listing-title">

                            <p className="creator-listing-label">
                              Website Listing
                            </p>

                            <h3>
                              {product.name}
                            </h3>

                          </div>


                          <span
                            className={getStatusClass(
                              product.approvalStatus,
                            )}
                          >

                            <span className="creator-status-dot" />

                            {product.approvalStatus ||
                              'PENDING'}

                          </span>

                        </div>


                        <p className="creator-listing-description">

                          {product.description ||
                            'No description provided for this website listing.'}

                        </p>


                        {/* =====================================
                            SCREENSHOTS
                        ===================================== */}

                        {Array.isArray(
                          product.screenshots,
                        ) &&
                          product.screenshots.length > 0 && (

                            <div className="creator-screenshots">

                              <div className="creator-screenshots-heading">

                                <span>
                                  Website Preview
                                </span>

                                <small>

                                  {product.screenshots.length}{' '}

                                  {product.screenshots.length === 1
                                    ? 'image'
                                    : 'images'}

                                </small>

                              </div>


                              <div className="creator-screenshot-grid">

                                {product.screenshots.map(
                                  (
                                    screenshot,
                                    index,
                                  ) => (

                                    <a
                                      key={`${screenshot}-${index}`}
                                      href={getScreenshotUrl(
                                        screenshot,
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="creator-screenshot-card"
                                    >

                                      <img
                                        src={getScreenshotUrl(
                                          screenshot,
                                        )}
                                        alt={`${product.name} screenshot ${index + 1}`}
                                      />

                                      <span>
                                        View ↗
                                      </span>

                                    </a>

                                  ),
                                )}

                              </div>

                            </div>

                          )}


                        {/* =====================================
                            LISTING META
                        ===================================== */}

                        <div className="creator-listing-meta">

                          <div>

                            <span>
                              Price
                            </span>

                            <strong className="creator-price">
                              {formatCurrency(
                                product.price,
                              )}
                            </strong>

                          </div>


                          <div>

                            <span>
                              Category
                            </span>

                            <strong>
                              {product.categoryName ||
                                '—'}
                            </strong>

                          </div>


                          <div>

                            <span>
                              Technology
                            </span>

                            <strong>
                              {product.technology ||
                                '—'}
                            </strong>

                          </div>


                          <div>

                            <span>
                              Submitted
                            </span>

                            <strong>
                              {formatDate(
                                product.createdAt,
                              )}
                            </strong>

                          </div>

                        </div>


                        {/* =====================================
                            ACTIONS
                        ===================================== */}

                        <div className="creator-listing-actions">

                          {product.demoUrl ? (

                            <a
                              href={product.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="creator-demo-link"
                            >

                              <span className="creator-action-icon">
                                ↗
                              </span>

                              <span>
                                View Live Demo
                              </span>

                            </a>

                          ) : (

                            <span className="creator-no-demo">
                              No demo URL provided
                            </span>

                          )}


                          <Link
                            to={`/creator/listings/${product._id}/edit`}
                            className="creator-edit-button"
                          >

                            Edit Listing

                            <span>
                              →
                            </span>

                          </Link>

                        </div>

                      </div>

                    </article>
                  )
                })}

              </div>

            )}

        </section>

      </section>

    </main>
  )
}