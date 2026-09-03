import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'

import './admin.css'
import './AdminChatPage.css'


function AdminChatPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [conversations, setConversations] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const { token } = useAuth()
  const navigate = useNavigate()


  // =========================================================
  // LOAD ALL CHAT CONVERSATIONS
  // =========================================================

  useEffect(() => {
    let isMounted = true

    async function loadConversations() {
      if (!token) {
        if (isMounted) {
          setLoading(false)
          setError(
            'Authentication token is unavailable.',
          )
        }

        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          '/admin/chat/conversations',
          {
            method: 'GET',
            token,
          },
        )

        if (isMounted) {
          setConversations(
            Array.isArray(
              data?.conversations,
            )
              ? data.conversations
              : [],
          )
        }
      } catch (requestError) {
        console.error(
          'Failed to load admin chat conversations:',
          requestError,
        )

        if (isMounted) {
          setError(
            requestError?.message ||
              'Failed to load chat conversations.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadConversations()

    return () => {
      isMounted = false
    }
  }, [token])


  // =========================================================
  // HELPERS
  // =========================================================

  function getBuyerName(conversation) {
    return (
      conversation?.buyer?.name ||
      conversation?.buyerName ||
      'Buyer'
    )
  }


  function getCreatorName(conversation) {
    return (
      conversation?.creator?.name ||
      conversation?.creatorName ||
      'Creator'
    )
  }


  function getProductName(conversation) {
    return (
      conversation?.product?.name ||
      conversation?.productName ||
      'Website Product'
    )
  }


  function getOrderId(conversation) {
    return (
      conversation?.orderId ||
      conversation?.order?._id ||
      '—'
    )
  }


  function getLastMessage(conversation) {
    return (
      conversation?.lastMessage?.content ||
      conversation?.lastMessage ||
      'No messages yet.'
    )
  }


  function getLastMessageDate(conversation) {
    return (
      conversation?.lastMessage?.createdAt ||
      conversation?.updatedAt ||
      conversation?.createdAt
    )
  }


  function getUnreadCount(conversation) {
    return Number(
      conversation?.unreadCount ||
        conversation?.unreadMessages ||
        0,
    )
  }


  function isClosed(conversation) {
    return (
      conversation?.status === 'CLOSED' ||
      conversation?.closed === true
    )
  }


  function formatDate(value) {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
  }


  // =========================================================
  // NAVIGATION
  // =========================================================

  function handleConversationClick(
    conversation,
  ) {
    const id =
      conversation?._id ||
      conversation?.id

    if (!id) {
      return
    }

    navigate(
      `/admin/chat/${id}`,
    )
  }


  // =========================================================
  // COUNTS
  // =========================================================

  const openCount =
    conversations.filter(
      (conversation) =>
        !isClosed(conversation),
    ).length

  const closedCount =
    conversations.filter(
      (conversation) =>
        isClosed(conversation),
    ).length

  const unreadCount =
    conversations.reduce(
      (total, conversation) =>
        total +
        getUnreadCount(conversation),
      0,
    )


  // =========================================================
  // RENDER
  // =========================================================

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
              PAGE HEADER
          ================================================= */}

          <section className="admin-page-header">

            <div className="admin-page-header-copy">

              <span className="admin-eyebrow">
                Marketplace
              </span>

              <h1>
                Messages
              </h1>

              <p>
                Monitor buyer and creator conversations
                linked to marketplace orders.
              </p>

            </div>


            <div className="admin-header-actions">

              <button
                className="admin-secondary-button"
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/dashboard',
                  )
                }
              >
                Dashboard
              </button>

            </div>

          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              role="alert"
              className="admin-dashboard-error"
            >
              {error}
            </div>

          )}

          <section className="admin-panel admin-suspension-support-entry">
              <div className="admin-suspension-support-entry-copy">
                <span className="admin-panel-eyebrow">
                  Account Support
                </span>

                <h2>
                  Suspension Support
                </h2>

                <p>
                  View and respond to suspended Buyer and Creator
                  support requests.
                </p>
              </div>

              <button
                type="button"
                className="admin-suspension-support-entry-button"
                onClick={() =>
                  navigate('/admin/suspension-support')
                }
              >
                Open Suspension Support
                <span aria-hidden="true">→</span>
              </button>
            </section>


          {/* =================================================
              SUMMARY
          ================================================= */}

          <section className="admin-stats-grid">

            <article className="admin-panel">

              <div className="admin-panel-header">

                <div>

                  <span className="admin-panel-eyebrow">
                    Conversations
                  </span>

                  <h2>
                    Total
                  </h2>

                </div>

              </div>

              <strong className="admin-chat-stat-value">
                {loading
                  ? '...'
                  : conversations.length}
              </strong>

            </article>


            <article className="admin-panel">

              <div className="admin-panel-header">

                <div>

                  <span className="admin-panel-eyebrow">
                    Active
                  </span>

                  <h2>
                    Open
                  </h2>

                </div>

              </div>

              <strong className="admin-chat-stat-value">
                {loading
                  ? '...'
                  : openCount}
              </strong>

            </article>


            <article className="admin-panel">

              <div className="admin-panel-header">

                <div>

                  <span className="admin-panel-eyebrow">
                    Unread
                  </span>

                  <h2>
                    Messages
                  </h2>

                </div>

              </div>

              <strong className="admin-chat-stat-value">
                {loading
                  ? '...'
                  : unreadCount}
              </strong>

            </article>


            <article className="admin-panel">

              <div className="admin-panel-header">

                <div>

                  <span className="admin-panel-eyebrow">
                    Completed
                  </span>

                  <h2>
                    Closed
                  </h2>

                </div>

              </div>

              <strong className="admin-chat-stat-value">
                {loading
                  ? '...'
                  : closedCount}
              </strong>

            </article>

          </section>


          {/* =================================================
              CONVERSATIONS
          ================================================= */}

          <section className="admin-panel admin-chat-panel">

            <div className="admin-panel-header">

              <div>

                <span className="admin-panel-eyebrow">
                  Communication
                </span>

                <h2>
                  All Conversations
                </h2>

              </div>


              <span className="admin-quick-actions-count">
                {loading
                  ? 'Loading'
                  : `${conversations.length} ${
                      conversations.length === 1
                        ? 'conversation'
                        : 'conversations'
                    }`}
              </span>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="admin-chat-state">

                <div className="admin-chat-loading-icon">
                  <span />
                </div>

                <div>

                  <strong>
                    Loading conversations
                  </strong>

                  <p>
                    Fetching marketplace messages.
                  </p>

                </div>

              </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
              !error &&
              conversations.length === 0 && (

                <div className="admin-chat-state">

                  <div className="admin-chat-empty-icon">
                    —
                  </div>

                  <div>

                    <strong>
                      No conversations yet
                    </strong>

                    <p>
                      Buyer and creator conversations
                      will appear here after a successful
                      marketplace purchase.
                    </p>

                  </div>

                </div>

              )}


            {/* =================================================
                CONVERSATIONS
            ================================================= */}

            {!loading &&
              !error &&
              conversations.length > 0 && (

                <div className="admin-chat-list">

                  {conversations.map(
                    (conversation) => {

                      const id =
                        conversation?._id ||
                        conversation?.id

                      const unread =
                        getUnreadCount(
                          conversation,
                        )

                      const closed =
                        isClosed(
                          conversation,
                        )

                      return (
                        <button
                          key={id}
                          type="button"
                          className="admin-chat-conversation"
                          onClick={() =>
                            handleConversationClick(
                              conversation,
                            )
                          }
                        >

                          <span className="admin-chat-conversation-icon">
                            💬
                          </span>


                          <span className="admin-chat-conversation-content">

                            <span className="admin-chat-conversation-top">

                              <strong>
                                {getBuyerName(
                                  conversation,
                                )}
                              </strong>

                              <time>
                                {formatDate(
                                  getLastMessageDate(
                                    conversation,
                                  ),
                                )}
                              </time>

                            </span>


                            <span className="admin-chat-participants">

                              <span>
                                Creator:
                              </span>

                              <strong>
                                {getCreatorName(
                                  conversation,
                                )}
                              </strong>

                            </span>


                            <span className="admin-chat-product">

                              <span>
                                Product:
                              </span>

                              <strong>
                                {getProductName(
                                  conversation,
                                )}
                              </strong>

                            </span>


                            <span className="admin-chat-preview">
                              {getLastMessage(
                                conversation,
                              )}
                            </span>


                            <span className="admin-chat-conversation-meta">

                              <span>
                                Order #{getOrderId(
                                  conversation,
                                )}
                              </span>


                              <span
                                className={
                                  closed
                                    ? 'admin-chat-status admin-chat-status-closed'
                                    : 'admin-chat-status admin-chat-status-open'
                                }
                              >
                                {closed
                                  ? 'Closed'
                                  : 'Open'}
                              </span>


                              {unread > 0 && (

                                <span className="admin-chat-unread">
                                  {unread} unread
                                </span>

                              )}

                            </span>

                          </span>


                          <span
                            className="admin-chat-conversation-arrow"
                            aria-hidden="true"
                          >
                            →
                          </span>

                        </button>
                      )
                    },
                  )}

                </div>

              )}

          </section>

        </main>

      </div>

    </div>
  )
}


export default AdminChatPage

export {
  AdminChatPage,
}

