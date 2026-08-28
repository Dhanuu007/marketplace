import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './BuyerChatPage.css'


export function BuyerChatPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { conversationId } = useParams()

  const [conversations, setConversations] =
    useState([])

  const [conversation, setConversation] =
    useState(null)

  const [messages, setMessages] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [conversationLoading, setConversationLoading] =
    useState(false)

  const [sending, setSending] =
    useState(false)

  const [error, setError] =
    useState('')

  const [messageText, setMessageText] =
    useState('')


  /*
   * Load all buyer conversations.
   */
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
          '/chat/conversations',
          {
            method: 'GET',
            token: auth.token,
          },
        )

        setConversations(
          Array.isArray(
            data?.conversations,
          )
            ? data.conversations
            : [],
        )
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load your conversations.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [auth.token])


  /*
   * Load the selected conversation
   * and its messages.
   */
  useEffect(() => {
    async function loadConversation() {
      if (!auth.token || !conversationId) {
        setConversation(null)
        setMessages([])
        return
      }

      try {
        setConversationLoading(true)
        setError('')

        const data = await apiRequest(
          `/chat/conversations/${conversationId}`,
          {
            method: 'GET',
            token: auth.token,
          },
        )

        setConversation(
          data?.conversation ?? null,
        )

        setMessages(
          Array.isArray(data?.messages)
            ? data.messages
            : [],
        )

        /*
         * Mark the conversation as read.
         */
        await apiRequest(
          `/chat/conversations/${conversationId}/read`,
          {
            method: 'PATCH',
            token: auth.token,
          },
        )

        /*
         * Remove the buyer unread count
         * from the list immediately.
         */
        setConversations(
          (currentConversations) =>
            currentConversations.map(
              (item) =>
                item.id === conversationId
                  ? {
                      ...item,
                      buyerUnreadCount: 0,
                    }
                  : item,
            ),
        )
      } catch (requestError) {
        setConversation(null)
        setMessages([])

        setError(
          requestError?.message ||
            'Unable to load this conversation.',
        )
      } finally {
        setConversationLoading(false)
      }
    }

    loadConversation()
  }, [
    auth.token,
    conversationId,
  ])


  function formatDate(value) {
    if (!value) {
      return '—'
    }

    return new Date(
      value,
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
  }


  function formatTime(value) {
    if (!value) {
      return ''
    }

    return new Date(
      value,
    ).toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    )
  }


  function openConversation(
    selectedConversationId,
  ) {
    navigate(
      `/buyer/chat/${selectedConversationId}`,
    )
  }


  function closeConversation() {
    navigate('/buyer/chat')
  }


  async function handleSendMessage(
    event,
  ) {
    event.preventDefault()

    const text =
      messageText.trim()

    if (
      !text ||
      !auth.token ||
      !conversationId ||
      sending
    ) {
      return
    }

    try {
      setSending(true)
      setError('')

      const data = await apiRequest(
        `/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          token: auth.token,
          body: {
            text,
          },
        },
      )

      if (data?.message) {
        setMessages(
          (currentMessages) => [
            ...currentMessages,
            data.message,
          ],
        )
      }

      if (data?.conversation) {
        setConversation(
          data.conversation,
        )

        setConversations(
          (currentConversations) =>
            currentConversations.map(
              (item) =>
                item.id === conversationId
                  ? data.conversation
                  : item,
            ),
        )
      }

      setMessageText('')
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to send your message.',
      )
    } finally {
      setSending(false)
    }
  }


  return (
    <main className="buyer-chat-shell">

      <section className="buyer-chat-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="buyer-chat-header">

          <div>

            <p className="buyer-eyebrow">
              Marketplace Support
            </p>

            <h1>
              Messages
            </h1>

            <p>
              Chat with creators about websites
              you have purchased.
            </p>

          </div>


          <div className="buyer-chat-header-actions">

            <Link
              to="/buyer/dashboard"
              className="buyer-chat-secondary-button"
            >
              ← Buyer Dashboard
            </Link>

            <Link
              to="/buyer/orders"
              className="buyer-chat-primary-button"
            >
              My Orders →
            </Link>

          </div>

        </header>


        {/* =====================================================
            CONTENT
        ===================================================== */}

        <section className="buyer-chat-section">

          <div className="buyer-chat-section-heading">

            <div>

              <p className="buyer-eyebrow">
                Your Conversations
              </p>

              <h2>
                Creator Messages
              </h2>

              <p>
                Conversations are connected to
                your purchased websites.
              </p>

            </div>


            <span className="buyer-chat-count">

              {conversations.length}{' '}

              {conversations.length === 1
                ? 'conversation'
                : 'conversations'}

            </span>

          </div>


          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (

            <div className="buyer-chat-error">

              <strong>
                Unable to load messages
              </strong>

              <span>
                {error}
              </span>

            </div>

          )}


          {/* ===================================================
              SELECTED CONVERSATION
          =================================================== */}

          {conversationId && (

            <div className="buyer-chat-window">

              <div className="buyer-chat-window-header">

                <div>

                  <button
                    type="button"
                    className="buyer-chat-back-button"
                    onClick={closeConversation}
                  >
                    ← Back
                  </button>

                  <p className="buyer-eyebrow">
                    Creator Conversation
                  </p>

                  <h2>
                    {conversation?.productName ||
                      'Purchased Website'}
                  </h2>

                  <p>
                    Creator:{' '}
                    <strong>
                      {conversation?.creatorName ||
                        'Website Creator'}
                    </strong>
                  </p>

                </div>


                {conversation && (

                  <span
                    className={
                      conversation.status ===
                      'CLOSED'
                        ? 'buyer-chat-status closed'
                        : 'buyer-chat-status'
                    }
                  >
                    {conversation.status}
                  </span>

                )}

              </div>


              {conversationLoading ? (

                <div className="buyer-chat-message">

                  <div className="buyer-chat-spinner" />

                  <div>

                    <strong>
                      Loading conversation
                    </strong>

                    <span>
                      Please wait while we fetch
                      your messages.
                    </span>

                  </div>

                </div>

              ) : conversation ? (

                <>

                  <div className="buyer-chat-messages">

                    {messages.length === 0 ? (

                      <div className="buyer-chat-no-messages">

                        <div className="buyer-chat-empty-icon">
                          💬
                        </div>

                        <strong>
                          Start the conversation
                        </strong>

                        <span>
                          Send a message to the creator
                          about your purchased website.
                        </span>

                      </div>

                    ) : (

                      messages.map(
                        (message) => {

                          const isBuyer =
                            message?.senderRole
                              ?.toString()
                              .toUpperCase() === 'BUYER'

                          return (
                            <div
                              key={
                                message.id
                              }
                              className={
                                isBuyer
                                  ? 'buyer-chat-message-row buyer'
                                  : 'buyer-chat-message-row creator'
                              }
                            >

                              <div
                                className={
                                  isBuyer
                                    ? 'buyer-chat-bubble buyer'
                                    : 'buyer-chat-bubble creator'
                                }
                              >

                                <span className="buyer-chat-message-role">
                                  {isBuyer
                                    ? 'You'
                                    : 'Creator'}
                                </span>

                                <p>
                                  {message.text}
                                </p>

                                <time>
                                  {formatTime(
                                    message.createdAt,
                                  )}
                                </time>

                              </div>

                            </div>
                          )
                        },
                      )

                    )}

                  </div>


                  {conversation.status ===
                  'CLOSED' ? (

                    <div className="buyer-chat-closed">

                      <strong>
                        This conversation is closed.
                      </strong>

                      <span>
                        New messages can no longer
                        be sent.
                      </span>

                    </div>

                  ) : (

                    <form
                      className="buyer-chat-composer"
                      onSubmit={
                        handleSendMessage
                      }
                    >

                      <textarea
                        value={
                          messageText
                        }
                        onChange={(event) =>
                          setMessageText(
                            event.target.value,
                          )
                        }
                        placeholder="Write a message to the creator..."
                        rows={3}
                        maxLength={2000}
                        disabled={sending}
                      />

                      <div className="buyer-chat-composer-footer">

                        <span>
                          {messageText.length}/2000
                        </span>

                        <button
                          type="submit"
                          className="buyer-chat-send-button"
                          disabled={
                            sending ||
                            !messageText.trim()
                          }
                        >
                          {sending
                            ? 'Sending...'
                            : 'Send Message →'}
                        </button>

                      </div>

                    </form>

                  )}

                </>

              ) : null}

            </div>

          )}


          {/* ===================================================
              LIST VIEW
          =================================================== */}

          {!conversationId && (

            <>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (

                <div className="buyer-chat-message">

                  <div className="buyer-chat-spinner" />

                  <div>

                    <strong>
                      Loading your messages
                    </strong>

                    <span>
                      Please wait while we fetch
                      your conversations.
                    </span>

                  </div>

                </div>

              )}


              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loading &&
                !error &&
                conversations.length === 0 && (

                  <div className="buyer-chat-empty">

                    <div className="buyer-chat-empty-icon">
                      💬
                    </div>

                    <p className="buyer-eyebrow">
                      No Conversations
                    </p>

                    <h3>
                      You don't have any chats yet
                    </h3>

                    <p>
                      After purchasing a website,
                      you can contact its creator
                      directly from your order.
                    </p>

                    <Link
                      to="/buyer/orders"
                      className="buyer-chat-empty-button"
                    >
                      View My Orders →
                    </Link>

                  </div>

                )}


              {/* =================================================
                  CONVERSATIONS
              ================================================= */}

              {!loading &&
                !error &&
                conversations.length > 0 && (

                  <div className="buyer-chat-list">

                    {conversations.map(
                      (conversationItem) => (

                        <button
                          key={
                            conversationItem.id
                          }
                          type="button"
                          className="buyer-chat-card"
                          onClick={() =>
                            openConversation(
                              conversationItem.id,
                            )
                          }
                        >

                          <div className="buyer-chat-card-icon">
                            💬
                          </div>


                          <div className="buyer-chat-card-content">

                            <div className="buyer-chat-card-top">

                              <h3>
                                {conversationItem.productName ||
                                  'Purchased Website'}
                              </h3>

                              {conversationItem.buyerUnreadCount >
                                0 && (

                                <span className="buyer-chat-unread">
                                  {
                                    conversationItem.buyerUnreadCount
                                  }
                                </span>

                              )}

                            </div>


                            <p className="buyer-chat-creator">

                              Creator:{' '}

                              <strong>
                                {conversationItem.creatorName ||
                                  'Website Creator'}
                              </strong>

                            </p>


                            <p className="buyer-chat-last-message">

                              {conversationItem.lastMessage ||
                                'Start a conversation with the creator.'}

                            </p>

                          </div>


                          <div className="buyer-chat-card-meta">

                            <span>
                              {formatDate(
                                conversationItem.lastMessageAt ||
                                  conversationItem.updatedAt,
                              )}
                            </span>

                            <strong>
                              →
                            </strong>

                          </div>

                        </button>

                      ),
                    )}

                  </div>

                )}

            </>

          )}

        </section>

      </section>

    </main>
  )
}

