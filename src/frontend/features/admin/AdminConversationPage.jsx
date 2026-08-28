import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'

import './admin.css'
import './AdminConversationPage.css'


export function AdminConversationPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [conversation, setConversation] =
    useState(null)

    const [messages, setMessages] =
  useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [closing, setClosing] =
    useState(false)

  const [closeError, setCloseError] =
    useState('')

  const { token } = useAuth()
  const { conversationId } = useParams()
  const navigate = useNavigate()


  // =========================================================
  // LOAD CONVERSATION
  // =========================================================

  useEffect(() => {
    let isMounted = true

    async function loadConversation() {
      if (!token) {
        if (isMounted) {
          setLoading(false)
          setError(
            'Authentication token is unavailable.',
          )
        }

        return
      }

      if (!conversationId) {
        if (isMounted) {
          setLoading(false)
          setError(
            'Conversation ID is missing.',
          )
        }

        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          `/chat/conversations/${conversationId}`,
          {
            method: 'GET',
            token,
          },
        )

        if (isMounted) {
          setConversation(
            data?.conversation ?? null,
          )

          setMessages(
              Array.isArray(data?.messages)
                ? data.messages
                : [],
            )
        }
      } catch (requestError) {
        console.error(
          'Failed to load admin conversation:',
          requestError,
        )

        if (isMounted) {
          setError(
            requestError?.message ||
              'Failed to load conversation.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadConversation()

    return () => {
      isMounted = false
    }
  }, [
    token,
    conversationId,
  ])


  // =========================================================
  // HELPERS
  // =========================================================

  function getBuyerName() {
    return (
      conversation?.buyer?.name ||
      conversation?.buyerName ||
      'Buyer'
    )
  }


  function getCreatorName() {
    return (
      conversation?.creator?.name ||
      conversation?.creatorName ||
      'Creator'
    )
  }


  function getProductName() {
    return (
      conversation?.product?.name ||
      conversation?.productName ||
      'Website Product'
    )
  }


  function getOrderId() {
    return (
      conversation?.orderId ||
      conversation?.order?._id ||
      '—'
    )
  }


  function getStatus() {
    return (
      conversation?.status ||
      'OPEN'
    )
  }


  function isClosed() {
    return (
      String(
        getStatus(),
      ).toUpperCase() === 'CLOSED'
    )
  }


  function getMessageSender(message) {
    const senderRole =
      String(
        message?.senderRole ||
          message?.role ||
          '',
      ).toUpperCase()

    if (senderRole === 'BUYER') {
      return 'Buyer'
    }

    if (senderRole === 'CREATOR') {
      return 'Creator'
    }

    if (senderRole === 'ADMIN') {
      return 'Admin'
    }

    return (
      message?.sender?.name ||
      message?.senderName ||
      'Participant'
    )
  }


  function getMessageContent(message) {
    return (
      message?.content ||
      message?.message ||
      message?.text ||
      ''
    )
  }


  function getMessageDate(message) {
    return (
      message?.createdAt ||
      message?.updatedAt
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


  function formatDateTime(value) {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    )
  }


  function getMessageClass(message) {
    const role =
      String(
        message?.senderRole ||
          message?.role ||
          '',
      ).toUpperCase()

    if (role === 'BUYER') {
      return 'admin-chat-message admin-chat-message-buyer'
    }

    if (role === 'CREATOR') {
      return 'admin-chat-message admin-chat-message-creator'
    }

    if (role === 'ADMIN') {
      return 'admin-chat-message admin-chat-message-admin'
    }

    return 'admin-chat-message'
  }


  // =========================================================
  // CLOSE CONVERSATION
  // =========================================================

  async function handleCloseConversation() {
    if (!conversationId) {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to close this conversation?',
    )

    if (!confirmed) {
      return
    }

    try {
      setClosing(true)
      setCloseError('')

      const data = await apiRequest(
        `/admin/chat/conversations/${conversationId}/close`,
        {
          method: 'PATCH',
          token,
        },
      )

      setConversation(
        data?.conversation ??
          {
            ...conversation,
            status: 'CLOSED',
          },
      )
    } catch (requestError) {
      console.error(
        'Failed to close conversation:',
        requestError,
      )

      setCloseError(
        requestError?.message ||
          'Unable to close this conversation.',
      )
    } finally {
      setClosing(false)
    }
  }


  // =========================================================
  // MESSAGE DATA
  // =========================================================
  const closed =
    isClosed()


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
                Messages
              </span>

              <h1>
                Conversation
              </h1>

              <p>
                Review the Buyer and Creator conversation
                linked to this marketplace order.
              </p>

            </div>


            <div className="admin-header-actions">

              <button
                className="admin-secondary-button"
                type="button"
                onClick={() =>
                  navigate('/admin/chat')
                }
              >
                ← All Messages
              </button>


              {!loading &&
                conversation &&
                !closed && (

                  <button
                    className="admin-primary-button admin-chat-close-button"
                    type="button"
                    onClick={
                      handleCloseConversation
                    }
                    disabled={closing}
                  >
                    {closing
                      ? 'Closing...'
                      : 'Close Conversation'}
                  </button>

                )}

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


          {/* =================================================
              CLOSE ERROR
          ================================================= */}

          {closeError && (

            <div
              role="alert"
              className="admin-dashboard-error"
            >
              {closeError}
            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <section className="admin-panel">

              <div className="admin-chat-state">

                <div className="admin-chat-loading-icon">
                  <span />
                </div>

                <div>

                  <strong>
                    Loading conversation
                  </strong>

                  <p>
                    Fetching the conversation and
                    message history.
                  </p>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              CONVERSATION
          ================================================= */}

          {!loading &&
            !error &&
            conversation && (

              <div className="admin-conversation-layout">

                {/* =========================================
                    CONVERSATION DETAILS
                ========================================= */}

                <section className="admin-panel admin-conversation-details">

                  <div className="admin-panel-header">

                    <div>

                      <span className="admin-panel-eyebrow">
                        Order Conversation
                      </span>

                      <h2>
                        Conversation Details
                      </h2>

                    </div>


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

                  </div>


                  <div className="admin-conversation-meta-grid">

                    <div>

                      <span>
                        Buyer
                      </span>

                      <strong>
                        {getBuyerName()}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Creator
                      </span>

                      <strong>
                        {getCreatorName()}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Product
                      </span>

                      <strong>
                        {getProductName()}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Order
                      </span>

                      <strong>
                        #{getOrderId()}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Created
                      </span>

                      <strong>
                        {formatDate(
                          conversation?.createdAt,
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Messages
                      </span>

                      <strong>
                        {messages.length}
                      </strong>

                    </div>

                  </div>

                </section>


                {/* =========================================
                    MESSAGE HISTORY
                ========================================= */}

                <section className="admin-panel admin-conversation-messages">

                  <div className="admin-panel-header">

                    <div>

                      <span className="admin-panel-eyebrow">
                        Communication
                      </span>

                      <h2>
                        Message History
                      </h2>

                    </div>

                  </div>


                  <div className="admin-message-history">

                    {messages.length === 0 && (

                      <div className="admin-chat-state">

                        <div className="admin-chat-empty-icon">
                          —
                        </div>

                        <div>

                          <strong>
                            No messages yet
                          </strong>

                          <p>
                            The conversation has been
                            created but no messages have
                            been exchanged.
                          </p>

                        </div>

                      </div>

                    )}


                    {messages.length > 0 && (

                      <div className="admin-message-list">

                        {messages.map(
                          (
                            message,
                            index,
                          ) => {

                            const content =
                              getMessageContent(
                                message,
                              )

                            const sender =
                              getMessageSender(
                                message,
                              )

                            const senderRole =
                              String(
                                message?.senderRole ||
                                  message?.role ||
                                  '',
                              ).toUpperCase()

                            return (

                              <article
                                key={
                                  message?._id ||
                                  message?.id ||
                                  `${sender}-${message?.createdAt}-${index}`
                                }
                                className={getMessageClass(
                                  message,
                                )}
                              >

                                <div className="admin-message-avatar">

                                  {sender
                                    .charAt(0)
                                    .toUpperCase()}

                                </div>


                                <div className="admin-message-body">

                                  <div className="admin-message-header">

                                    <strong>
                                      {sender}
                                    </strong>

                                    {senderRole && (

                                      <span>
                                        {senderRole}
                                      </span>

                                    )}

                                    <time
                                      dateTime={
                                        getMessageDate(
                                          message,
                                        ) ||
                                        undefined
                                      }
                                    >
                                      {formatDateTime(
                                        getMessageDate(
                                          message,
                                        ),
                                      )}
                                    </time>

                                  </div>


                                  <div className="admin-message-bubble">

                                    {content ||
                                      'No message content.'}

                                  </div>

                                </div>

                              </article>

                            )
                          },
                        )}

                      </div>

                    )}

                  </div>

                </section>


                {/* =========================================
                    FOOTER NOTICE
                ========================================= */}

                <section className="admin-panel admin-conversation-notice">

                  <div className="admin-conversation-notice-icon">
                    i
                  </div>

                  <div>

                    <strong>
                      Admin access
                    </strong>

                    <p>
                      You are viewing this conversation
                      as an administrator. Messages remain
                      between the Buyer and Creator.
                      Closing the conversation prevents
                      further conversation activity
                      according to the chat backend rules.
                    </p>

                  </div>

                </section>


                {/* =========================================
                    BACK TO MESSAGES
                ========================================= */}

                <div className="admin-conversation-footer">

                  <Link
                    to="/admin/chat"
                    className="admin-secondary-button"
                  >
                    ← Back to Messages
                  </Link>

                </div>

              </div>

            )}

        </main>

      </div>

    </div>
  )
}


export default AdminConversationPage