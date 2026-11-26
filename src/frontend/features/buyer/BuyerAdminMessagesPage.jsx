
import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './BuyerAdminMessagesPage.css'

function BuyerAdminMessagesPage() {
  const { token } = useAuth()

  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadConversations = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/chat/admin-direct-messages', {
        method: 'GET',
        token,
      })

      setConversations(
        Array.isArray(data?.conversations)
          ? data.conversations
          : [],
      )
    } catch (requestError) {
      setError(
        requestError?.message || 'Unable to load Admin messages.',
      )
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
  let isMounted = true

  async function fetchConversations() {
    if (!token) return

    try {
      const data = await apiRequest('/chat/admin-direct-messages', {
        method: 'GET',
        token,
      })

      if (isMounted) {
        setConversations(
          Array.isArray(data?.conversations)
            ? data.conversations
            : [],
        )
      }
    } catch (requestError) {
      if (isMounted) {
        setError(
          requestError?.message || 'Unable to load Admin messages.',
        )
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  fetchConversations()

  return () => {
    isMounted = false
  }
}, [token])

  async function openConversation(conversationId) {
    if (!token || !conversationId) return

    try {
      setLoadingConversation(true)
      setError('')

      const data = await apiRequest(
        `/chat/admin-direct-messages/${conversationId}`,
        {
          method: 'GET',
          token,
        },
      )

      setSelectedConversation(data?.conversation ?? null)
      setMessages(
        Array.isArray(data?.messages) ? data.messages : [],
      )

      const readData = await apiRequest(
        `/chat/admin-direct-messages/${conversationId}/read`,
        {
          method: 'PATCH',
          token,
        },
      )

      if (readData?.conversation) {
        setSelectedConversation(readData.conversation)

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? readData.conversation
              : conversation,
          ),
        )
      }
    } catch (requestError) {
      setError(
        requestError?.message || 'Unable to open this conversation.',
      )
    } finally {
      setLoadingConversation(false)
    }
  }

  async function sendMessage(event) {
    event.preventDefault()

    const cleanText = messageText.trim()

    if (
      !token ||
      !selectedConversation?.id ||
      !cleanText ||
      sending ||
      selectedConversation.status === 'CLOSED'
    ) {
      return
    }

    try {
      setSending(true)
      setError('')

      const data = await apiRequest(
        `/chat/admin-direct-messages/${selectedConversation.id}/messages`,
        {
          method: 'POST',
          token,
          body: {
            text: cleanText,
          },
        },
      )

      if (data?.message) {
        setMessages((current) => [...current, data.message])
      }

      if (data?.conversation) {
        setSelectedConversation(data.conversation)

        setConversations((current) => [
          data.conversation,
          ...current.filter(
            (item) => item.id !== data.conversation.id,
          ),
        ])
      }

      setMessageText('')
    } catch (requestError) {
      setError(
        requestError?.message || 'Unable to send your message.',
      )
    } finally {
      setSending(false)
    }
  }

  function formatTime(value) {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalUnread = conversations.reduce(
    (total, conversation) =>
      total + (conversation.recipientUnreadCount || 0),
    0,
  )

  return (
    <main className="buyer-admin-messages-shell">
      <div className="buyer-admin-messages-container">
        <header className="buyer-admin-messages-header">
          <div>
            <p className="buyer-eyebrow">Marketplace Communication</p>
            <h1>Admin Messages</h1>
            <p>
              View private messages from the Marketplace Admin and
              reply directly.
            </p>
          </div>

          <div className="buyer-admin-messages-header-actions">
            <button
              type="button"
              className="buyer-admin-refresh-button"
              onClick={loadConversations}
              disabled={loading}
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>
        </header>

        {error && (
          <div className="buyer-admin-messages-error" role="alert">
            <strong>Something went wrong</strong>
            <span>{error}</span>
          </div>
        )}

        <section className="buyer-admin-messages-section">
          <div className="buyer-admin-messages-section-heading">
            <div>
              <p className="buyer-eyebrow">Private Communication</p>
              <h2>Your Admin Inbox</h2>
              <p>
                Messages and replies between you and the Marketplace
                Admin.
              </p>
            </div>

            <span className="buyer-admin-messages-count">
              {totalUnread > 0
                ? `${totalUnread} unread`
                : `${conversations.length} conversations`}
            </span>
          </div>

          {loading ? (
            <div className="buyer-admin-messages-loading">
              <span className="buyer-admin-messages-spinner" />
              <strong>Loading your messages...</strong>
            </div>
          ) : conversations.length === 0 ? (
            <div className="buyer-admin-messages-empty">
              <div className="buyer-admin-messages-empty-icon">✉️</div>
              <h3>No Admin messages yet</h3>
              <p>
                When the Marketplace Admin sends you a private message,
                it will appear here.
              </p>
            </div>
          ) : (
            <div className="buyer-admin-messages-workspace">
              <aside className="buyer-admin-messages-sidebar">
                <div className="buyer-admin-messages-list-heading">
                  <strong>Conversations</strong>
                  <span>{conversations.length}</span>
                </div>

                <div className="buyer-admin-messages-list">
                  {conversations.map((conversation) => (
                    <button
                      type="button"
                      key={conversation.id}
                      className={
                        selectedConversation?.id === conversation.id
                          ? 'buyer-admin-conversation selected'
                          : 'buyer-admin-conversation'
                      }
                      onClick={() => openConversation(conversation.id)}
                    >
                      <span className="buyer-admin-avatar">A</span>

                      <span className="buyer-admin-conversation-info">
                        <strong>
                          {conversation.adminName || 'Marketplace Admin'}
                        </strong>

                        <small>
                          {conversation.lastMessage ||
                            'Open conversation'}
                        </small>
                      </span>

                      {conversation.recipientUnreadCount > 0 && (
                        <span className="buyer-admin-unread">
                          {conversation.recipientUnreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </aside>

              <div className="buyer-admin-messages-chat">
                {!selectedConversation ? (
                  <div className="buyer-admin-chat-welcome">
                    <div>💬</div>
                    <h3>Your Admin Inbox</h3>
                    <p>
                      Select a conversation to view messages from the
                      Marketplace Admin.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="buyer-admin-chat-header">
                      <div className="buyer-admin-avatar">A</div>

                      <div>
                        <strong>
                          {selectedConversation.adminName ||
                            'Marketplace Admin'}
                        </strong>
                        <small>Marketplace Administration</small>
                      </div>

                      <span
                        className={
                          selectedConversation.status === 'CLOSED'
                            ? 'buyer-admin-status closed'
                            : 'buyer-admin-status'
                        }
                      >
                        {selectedConversation.status || 'OPEN'}
                      </span>
                    </div>

                    <div className="buyer-admin-chat-messages">
                      {loadingConversation ? (
                        <div className="buyer-admin-chat-loading">
                          Loading conversation...
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="buyer-admin-chat-no-messages">
                          <strong>No messages yet</strong>
                          <span>
                            Your conversation with Admin will appear here.
                          </span>
                        </div>
                      ) : (
                        messages.map((item) => {
                          const isBuyer = item.senderRole === 'BUYER'

                          return (
                            <div
                              key={item.id}
                              className={
                                isBuyer
                                  ? 'buyer-admin-message-row own'
                                  : 'buyer-admin-message-row'
                              }
                            >
                              <div
                                className={
                                  isBuyer
                                    ? 'buyer-admin-message-bubble own'
                                    : 'buyer-admin-message-bubble'
                                }
                              >
                                <span className="buyer-admin-message-role">
                                  {isBuyer ? 'You' : 'Marketplace Admin'}
                                </span>

                                <p>{item.text}</p>

                                <time>
                                  {formatTime(item.createdAt)}
                                </time>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {selectedConversation.status === 'CLOSED' ? (
                      <div className="buyer-admin-chat-closed">
                        <strong>This conversation is closed.</strong>
                        <span>You cannot send new replies.</span>
                      </div>
                    ) : (
                      <form
                        className="buyer-admin-chat-composer"
                        onSubmit={sendMessage}
                      >
                        <textarea
                          value={messageText}
                          onChange={(event) =>
                            setMessageText(event.target.value)
                          }
                          placeholder="Write your reply to Admin..."
                          rows={3}
                          maxLength={2000}
                          disabled={sending}
                        />

                        <div className="buyer-admin-chat-composer-footer">
                          <span>{messageText.length}/2000</span>

                          <button
                            type="submit"
                            className="buyer-admin-send-button"
                            disabled={sending || !messageText.trim()}
                          >
                            {sending ? 'Sending...' : 'Send Reply →'}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default BuyerAdminMessagesPage
export { BuyerAdminMessagesPage }
