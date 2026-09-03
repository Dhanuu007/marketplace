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

  const isSuspended =
    auth.user?.suspended === true

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
  // SUSPENSION SUPPORT CHAT
  // =========================================================

  const [supportConversation, setSupportConversation] =
    useState(null)

  const [supportMessages, setSupportMessages] =
    useState([])

  const [supportMessageText, setSupportMessageText] =
    useState('')

  const [supportLoading, setSupportLoading] =
    useState(false)

  const [supportSending, setSupportSending] =
    useState(false)

  const [supportError, setSupportError] =
    useState('')


  // =========================================================
  // LOAD CREATOR LISTINGS
  // =========================================================

  useEffect(() => {
    async function loadCreatorProducts() {
      if (!auth.token || isSuspended) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        setError('')

        const data = await apiRequest(
          '/products/creator',
          {
            method: 'GET',
            token: auth.token,
          },
        )

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
  }, [
    auth.token,
    isSuspended,
  ])


  // =========================================================
  // LOAD CREATOR ORDERS
  // =========================================================

  useEffect(() => {
    async function loadCreatorOrders() {
      if (!auth.token || isSuspended) {
        setOrders([])
        setOrdersLoading(false)
        setOrdersError('')
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
  }, [
    auth.token,
    isSuspended,
  ])


  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    if (!auth.token || isSuspended) {
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
          apiRequest(
            '/notifications',
            {
              method: 'GET',
              token: auth.token,
            },
          ),

          apiRequest(
            '/notifications/unread-count',
            {
              method: 'GET',
              token: auth.token,
            },
          ),
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
          Number(
            unreadData?.count || 0,
          ),
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
        if (
          !cancelled &&
          showLoading
        ) {
          setNotificationsLoading(false)
        }
      }
    }


    const timeout =
      window.setTimeout(
        () => {
          fetchNotifications()
        },
        0,
      )


    const interval =
      window.setInterval(
        () => {
          fetchNotifications({
            showLoading: false,
          })
        },
        30000,
      )


    return () => {
      cancelled = true

      window.clearTimeout(
        timeout,
      )

      window.clearInterval(
        interval,
      )
    }
  }, [
    auth.token,
    isSuspended,
  ])


  // =========================================================
  // LOAD / CREATE SUSPENSION SUPPORT CONVERSATION
  // =========================================================

  useEffect(() => {
    async function loadSupportConversation() {
      if (!auth.token || !isSuspended) {
        setSupportConversation(null)
        setSupportMessages([])
        setSupportLoading(false)
        setSupportError('')
        return
      }


      try {
        setSupportLoading(true)
        setSupportError('')


        const conversationData =
          await apiRequest(
            '/chat/suspension-support/conversation',
            {
              method: 'GET',
              token: auth.token,
            },
          )


        const conversation =
          conversationData?.conversation ??
          null


        setSupportConversation(
          conversation,
        )


        if (!conversation?.id) {
          throw new Error(
            'Unable to create the support conversation.',
          )
        }


        const data =
          await apiRequest(
            `/chat/suspension-support/conversations/${encodeURIComponent(
              conversation.id,
            )}`,
            {
              method: 'GET',
              token: auth.token,
            },
          )


        setSupportConversation(
          data?.conversation ??
            conversation,
        )


        setSupportMessages(
          Array.isArray(data?.messages)
            ? data.messages
            : [],
        )


        await apiRequest(
          `/chat/suspension-support/conversations/${encodeURIComponent(
            conversation.id,
          )}/read`,
          {
            method: 'PATCH',
            token: auth.token,
          },
        )
      } catch (error) {
        setSupportError(
          error?.message ||
            'Unable to open suspension support chat.',
        )
      } finally {
        setSupportLoading(false)
      }
    }


    loadSupportConversation()
  }, [
    auth.token,
    isSuspended,
  ])


  // =========================================================
  // LISTING STATISTICS
  // =========================================================

  const pendingCount =
    products.filter(
      (product) =>
        product.approvalStatus === 'PENDING',
    ).length


  const approvedCount =
    products.filter(
      (product) =>
        product.approvalStatus === 'APPROVED',
    ).length


  const rejectedCount =
    products.filter(
      (product) =>
        product.approvalStatus === 'REJECTED',
    ).length


  // =========================================================
  // ORDER STATISTICS
  // =========================================================

  const totalSales =
    orders.reduce(
      (total, order) =>
        total +
        Number(
          order.totalAmount || 0,
        ),
      0,
    )


  const pendingDeliveryCount =
    orders.reduce(
      (total, order) =>
        total +
        (order.items ?? []).filter(
          (item) =>
            item.delivery?.status !==
            'DELIVERED',
        ).length,
      0,
    )


  const deliveredCount =
    orders.reduce(
      (total, order) =>
        total +
        (order.items ?? []).filter(
          (item) =>
            item.delivery?.status ===
            'DELIVERED',
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

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—'
    }

    return date.toLocaleDateString(
      'en-IN',
    )
  }


  function formatNotificationDate(
    value,
  ) {
    if (!value) {
      return ''
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return ''
    }

    return date.toLocaleString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      },
    )
  }


  function getStatusClass(
    status,
  ) {
    return `creator-status creator-status-${String(
      status || 'PENDING',
    ).toLowerCase()}`
  }


  function getScreenshotUrl(
    path,
  ) {
    if (!path) {
      return ''
    }

    if (
      path.startsWith(
        'http://',
      ) ||
      path.startsWith(
        'https://',
      )
    ) {
      return path
    }

    return `${API_ORIGIN}${path}`
  }


  function formatSupportTime(
    value,
  ) {
    if (!value) {
      return ''
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return ''
    }

    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    )
  }


  function isOwnSupportMessage(
    message,
  ) {
    const currentUserId =
      auth.user?.id

    const senderId =
      message?.senderId

    return Boolean(
      currentUserId &&
      senderId &&
      String(currentUserId) ===
        String(senderId),
    )
  }


  // =========================================================
  // SEND SUSPENSION SUPPORT MESSAGE
  // =========================================================

  async function handleSendSupportMessage(
    event,
  ) {
    event.preventDefault()

    const text =
      supportMessageText.trim()


    if (
      !text ||
      supportSending ||
      !supportConversation?.id
    ) {
      return
    }


    if (!auth.token) {
      setSupportError(
        'Authentication is required.',
      )
      return
    }


    try {
      setSupportSending(true)
      setSupportError('')


      const data =
        await apiRequest(
          `/chat/suspension-support/conversations/${encodeURIComponent(
            supportConversation.id,
          )}/messages`,
          {
            method: 'POST',
            token: auth.token,
            body: {
              text,
            },
          },
        )


      if (data?.message) {
        setSupportMessages(
          (currentMessages) => [
            ...currentMessages,
            data.message,
          ],
        )
      }


      if (data?.conversation) {
        setSupportConversation(
          data.conversation,
        )
      }


      setSupportMessageText('')
    } catch (error) {
      setSupportError(
        error?.message ||
          'Unable to send your message.',
      )
    } finally {
      setSupportSending(false)
    }
  }


  // =========================================================
  // NOTIFICATION ACTIONS
  // =========================================================

  async function handleNotificationClick(
    notification,
  ) {
    if (
      isSuspended ||
      !notification?.id
    ) {
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


        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      read: true,
                    }
                  : item,
            ),
        )


        setNotificationUnreadCount(
          (count) =>
            Math.max(
              0,
              count - 1,
            ),
        )
      }
    } catch {
      // Keep navigation working even if
      // marking the notification fails.
    }


    setNotificationsOpen(
      false,
    )


    if (
      notification.relatedType ===
        'CONVERSATION' &&
      notification.relatedId
    ) {
      navigate(
        '/creator/chat',
        {
          state: {
            conversationId:
              notification.relatedId,
          },
        },
      )

      return
    }
  }


  async function handleMarkAllNotificationsRead() {
    if (
      isSuspended ||
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


      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              read: true,
            }),
          ),
      )


      setNotificationUnreadCount(
        0,
      )
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
    const confirmed =
      window.confirm(
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
            ACCOUNT SUSPENSION WARNING
        ================================================= */}

        {isSuspended && (

          <section
            className="creator-suspension-banner"
            role="alert"
            aria-live="polite"
          >

            <div className="creator-suspension-icon">
              !
            </div>


            <div className="creator-suspension-content">

              <p className="creator-suspension-eyebrow">
                Account Security
              </p>


              <h2>
                Account Suspended
              </h2>


              <p className="creator-suspension-message">
                Your Creator account has been suspended
                and marketplace actions are temporarily
                unavailable.
              </p>


              <div className="creator-suspension-reason">

                <span>
                  Suspension reason
                </span>


                <strong>
                  {auth.user?.suspensionReason ||
                    'No specific reason was provided.'}
                </strong>

              </div>


              <p className="creator-suspension-contact">
                Use the support chat below to contact
                the administrator and request assistance
                with your suspended account.
              </p>


              {/* =================================================
                  SUSPENSION SUPPORT CHAT
              ================================================= */}

              <section className="creator-suspension-support">

                <div className="creator-suspension-support-header">

                  <div>

                    <p className="creator-suspension-support-eyebrow">
                      Suspension Support
                    </p>


                    <h3>
                      Contact Administrator
                    </h3>


                    <span>
                      Discuss your suspension directly
                      with the Marketplace administrator.
                    </span>

                  </div>


                  <span
                    className={`creator-suspension-support-status ${
                      supportConversation?.status ===
                      'CLOSED'
                        ? 'creator-suspension-support-status-closed'
                        : ''
                    }`}
                  >
                    {supportConversation?.status ||
                      'OPEN'}
                  </span>

                </div>


                {supportError && (

                  <div className="creator-suspension-support-error">
                    {supportError}
                  </div>

                )}


                {supportLoading ? (

                  <div className="creator-suspension-support-loading">

                    <div className="creator-loading-spinner" />

                    <span>
                      Opening support chat...
                    </span>

                  </div>

                ) : (

                  <>

                    <div className="creator-suspension-support-messages">

                      {supportMessages.length === 0 ? (

                        <div className="creator-suspension-support-empty">

                          <strong>
                            Start the conversation
                          </strong>

                          <span>
                            Explain your issue or request
                            an administrator review of your
                            suspended account.
                          </span>

                        </div>

                      ) : (

                        supportMessages.map(
                          (message) => {

                            const own =
                              isOwnSupportMessage(
                                message,
                              )


                            return (

                              <div
                                key={
                                  message.id
                                }
                                className={`creator-suspension-support-message-row ${
                                  own
                                    ? 'creator-suspension-support-message-row-own'
                                    : ''
                                }`}
                              >

                                <div className="creator-suspension-support-message">

                                  <div className="creator-suspension-support-message-meta">

                                    <strong>
                                      {own
                                        ? 'You'
                                        : 'Admin'}
                                    </strong>


                                    <span>
                                      {formatSupportTime(
                                        message.createdAt,
                                      )}
                                    </span>

                                  </div>


                                  <p>
                                    {message.text ||
                                      message.content ||
                                      message.message ||
                                      ''}
                                  </p>

                                </div>

                              </div>

                            )
                          },
                        )

                      )}

                    </div>


                    {supportConversation?.status ===
                    'CLOSED' ? (

                      <div className="creator-suspension-support-closed">
                        This support conversation has
                        been closed by the administrator.
                      </div>

                    ) : (

                      <form
                        className="creator-suspension-support-composer"
                        onSubmit={
                          handleSendSupportMessage
                        }
                      >

                        <textarea
                          value={
                            supportMessageText
                          }
                          onChange={(
                            event,
                          ) =>
                            setSupportMessageText(
                              event.target.value,
                            )
                          }
                          placeholder="Write a message to the administrator..."
                          rows={3}
                          disabled={
                            supportSending
                          }
                        />


                        <div className="creator-suspension-support-composer-footer">

                          <span>
                            {supportMessageText.trim()
                              .length > 0
                              ? `${supportMessageText.trim().length} characters`
                              : 'Describe your issue clearly'}
                          </span>


                          <button
                            type="submit"
                            disabled={
                              supportSending ||
                              !supportMessageText.trim() ||
                              !supportConversation?.id
                            }
                          >
                            {supportSending
                              ? 'Sending...'
                              : 'Send Message'}
                          </button>

                        </div>

                      </form>

                    )}

                  </>

                )}

              </section>

            </div>

          </section>

        )}


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
                {auth.user?.name ||
                  'Creator'}
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
                {auth.user?.id ||
                  'ID not available'}
              </strong>

            </div>

          </div>


          <div className="creator-header-actions">

            <div
              className={
                isSuspended
                  ? 'creator-header-actions-blocked'
                  : ''
              }
              aria-hidden={
                isSuspended
              }
            >

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
                      (open) =>
                        !open,
                    )
                  }
                  aria-label="Open notifications"
                  aria-expanded={
                    notificationsOpen
                  }
                  disabled={
                    isSuspended
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


                {notificationsOpen &&
                  !isSuspended && (

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

            </div>


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
            RESTRICTED DASHBOARD CONTENT
        ================================================= */}

        <div
          className={
            isSuspended
              ? 'creator-dashboard-content creator-dashboard-content-suspended'
              : 'creator-dashboard-content'
          }
          aria-hidden={
            isSuspended
          }
        >

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


            {ordersError &&
              !ordersLoading && (

                <div className="creator-orders-mini-error">
                  Unable to load order statistics.
                </div>

              )}

          </section>


          {/* =================================================
              SALES STAT CARDS
          ================================================= */}

          <section className="creator-stats creator-sales-stats">

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
                  : formatCurrency(
                      totalSales,
                    )}
              </strong>

              <small>
                Total order value
              </small>

            </article>


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

            {!loading &&
              error && (

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

                  {products.map(
                    (product) => {

                      const hasScreenshot =
                        Array.isArray(
                          product.screenshots,
                        ) &&
                        product.screenshots.length >
                          0


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
                              product.screenshots.length >
                                0 && (

                                <div className="creator-screenshots">

                                  <div className="creator-screenshots-heading">

                                    <span>
                                      Website Preview
                                    </span>

                                    <small>

                                      {
                                        product.screenshots.length
                                      }{' '}

                                      {product.screenshots.length ===
                                      1
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
                    },
                  )}

                </div>

              )}

          </section>

        </div>

      </section>

    </main>
  )
}