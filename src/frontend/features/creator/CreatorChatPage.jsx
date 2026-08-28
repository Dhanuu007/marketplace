import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './CreatorChatPage.css'


export function CreatorChatPage() {
  const auth = useAuth()

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =========================================================
  // LOAD CREATOR CONVERSATIONS
  // =========================================================

  useEffect(() => {
    async function loadConversations() {
      if (!auth.token) {
        setConversations([])
        setLoading(false)
        setError('Authentication is required.')
        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          '/creator/chat/conversations',
          {
            method: 'GET',
            token: auth.token,
          },
        )

        setConversations(
          Array.isArray(data?.conversations)
            ? data.conversations
            : [],
        )
      } catch (error) {
        setError(
          error?.message ||
            'Unable to load your conversations.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [auth.token])


  // =========================================================
  // HELPERS
  // =========================================================

  function formatDate(value) {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }


  function getBuyerName(conversation) {
    return (
      conversation?.buyer?.name ||
      conversation?.buyerName ||
      'Buyer'
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


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="creator-chat-shell">

      <section className="creator-chat-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="creator-chat-header">

          <div className="creator-chat-header-copy">

            <Link
              to="/creator/dashboard"
              className="creator-chat-back"
            >
              ← Dashboard
            </Link>

            <p className="creator-chat-eyebrow">
              Creator Messages
            </p>

            <h1>
              Buyer Conversations
            </h1>

            <p className="creator-chat-subtitle">
              Communicate with buyers who have
              purchased your website listings.
            </p>

          </div>


          <div className="creator-chat-header-count">

            <span>
              Conversations
            </span>

            <strong>
              {loading
                ? '—'
                : conversations.length}
            </strong>

          </div>

        </header>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="creator-chat-message">

            <div className="creator-chat-spinner" />

            <div>

              <strong>
                Loading conversations
              </strong>

              <span>
                Please wait while we fetch your
                buyer messages.
              </span>

            </div>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (

          <div className="creator-chat-error">

            <div className="creator-chat-error-icon">
              !
            </div>

            <div>

              <strong>
                Unable to load conversations
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
          conversations.length === 0 && (

            <div className="creator-chat-empty">

              <div className="creator-chat-empty-icon">
                💬
              </div>

              <p className="creator-chat-eyebrow">
                No Conversations
              </p>

              <h2>
                No buyer messages yet
              </h2>

              <p>
                When a buyer purchases one of your
                website listings, a conversation will
                appear here so you can communicate
                with them directly.
              </p>

              <Link
                to="/creator/dashboard"
                className="creator-chat-primary-button"
              >
                Back to Dashboard
              </Link>

            </div>

          )}


        {/* =================================================
            CONVERSATIONS
        ================================================= */}

        {!loading &&
          !error &&
          conversations.length > 0 && (

            <section className="creator-chat-list">

              <div className="creator-chat-list-heading">

                <div>

                  <p className="creator-chat-eyebrow">
                    Your Inbox
                  </p>

                  <h2>
                    Recent Conversations
                  </h2>

                </div>

                <span>
                  {conversations.length}{' '}
                  {conversations.length === 1
                    ? 'conversation'
                    : 'conversations'}
                </span>

              </div>


              <div className="creator-chat-conversations">

                {conversations.map(
                  (conversation) => {

                    const unreadCount =
                      getUnreadCount(
                        conversation,
                      )

                    const closed =
                      isClosed(
                        conversation,
                      )

                    return (
                      <Link
                        key={
                          conversation._id ||
                          conversation.id
                        }
                        to={`/creator/chat/${
                          conversation._id ||
                          conversation.id
                        }`}
                        className="creator-chat-conversation"
                      >

                        {/* =================================
                            CONVERSATION ICON
                        ================================= */}

                        <div className="creator-chat-avatar">
                          💬
                        </div>


                        {/* =================================
                            CONVERSATION CONTENT
                        ================================= */}

                        <div className="creator-chat-conversation-main">

                          <div className="creator-chat-conversation-top">

                            <div className="creator-chat-buyer">

                              <strong>
                                {getBuyerName(
                                  conversation,
                                )}
                              </strong>

                              {unreadCount > 0 && (

                                <span className="creator-chat-unread">
                                  {unreadCount}
                                </span>

                              )}

                            </div>


                            <time>
                              {formatDate(
                                getLastMessageDate(
                                  conversation,
                                ),
                              )}
                            </time>

                          </div>


                          <div className="creator-chat-product">

                            <span>
                              Product
                            </span>

                            <strong>
                              {getProductName(
                                conversation,
                              )}
                            </strong>

                          </div>


                          <p className="creator-chat-preview">

                            {getLastMessage(
                              conversation,
                            )}

                          </p>


                          <div className="creator-chat-meta">

                            <span>
                              Order #{getOrderId(
                                conversation,
                              )}
                            </span>

                            <span
                              className={
                                closed
                                  ? 'creator-chat-status creator-chat-status-closed'
                                  : 'creator-chat-status creator-chat-status-open'
                              }
                            >
                              {closed
                                ? 'Closed'
                                : 'Open'}
                            </span>

                          </div>

                        </div>


                        {/* =================================
                            ARROW
                        ================================= */}

                        <div className="creator-chat-arrow">
                          →
                        </div>

                      </Link>
                    )
                  },
                )}

              </div>

            </section>

          )}

      </section>

    </main>
  )
}

