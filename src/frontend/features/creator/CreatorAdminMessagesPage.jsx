
import { useCallback, useEffect, useState } from 'react'

import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './CreatorAdminMessagesPage.css'

export function CreatorAdminMessagesPage() {
  const auth = useAuth()

  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadConversations = useCallback(async () => {
    if (!auth.token) {
      setConversations([])
      setLoading(false)
      setError('Authentication is required.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/chat/admin-direct-messages', {
        method: 'GET',
        token: auth.token,
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
  }, [auth.token])

  useEffect(() => {
    let cancelled = false

    async function fetchConversations() {
      try {
        const data = await apiRequest('/chat/admin-direct-messages', {
          method: 'GET',
          token: auth.token,
        })

        if (!cancelled) {
          setConversations(
            Array.isArray(data?.conversations)
              ? data.conversations
              : [],
          )
          setError('')
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.message || 'Unable to load Admin messages.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

       if (auth.token) {
      void fetchConversations()
    } else {
      queueMicrotask(() => {
        if (!cancelled) {
          setLoading(false)
          setError('Authentication is required.')
        }
      })
    }
    return () => {
      cancelled = true
    }
  }, [auth.token])

  async function openConversation(conversationId) {
    if (!auth.token || !conversationId) return

    try {
      setLoadingConversation(true)
      setError('')

      const data = await apiRequest(
        `/chat/admin-direct-messages/${encodeURIComponent(conversationId)}`,
        {
          method: 'GET',
          token: auth.token,
        },
      )

      setSelectedConversation(data?.conversation ?? null)
      setMessages(
        Array.isArray(data?.messages) ? data.messages : [],
      )

      const readData = await apiRequest(
        `/chat/admin-direct-messages/${encodeURIComponent(conversationId)}/read`,
        {
          method: 'PATCH',
          token: auth.token,
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
      !auth.token ||
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
        `/chat/admin-direct-messages/${encodeURIComponent(selectedConversation.id)}/messages`,
        {
          method: 'POST',
          token: auth.token,
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
        requestError?.message || 'Unable to send your reply.',
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
      total + Number(conversation.recipientUnreadCount || 0),
    0,
  )

  return (
    <main className="creator-admin-messages-shell">
      <section className="creator-admin-messages-container">
        <header className="creator-admin-messages-header">
          <div>
            <Link
              to="/creator/dashboard"
              className="creator-admin-messages-back"
            >
              ← Dashboard
            </Link>

            <p className="creator-admin-messages-eyebrow">
              Marketplace Communication
            </p>

            <h1>Admin Messages</h1>

            <p className="creator-admin-messages-subtitle">
              Receive private messages from the Marketplace Admin
              and reply directly.
            </p>
          </div>

          <button
            type="button"
            className="creator-admin-refresh-button"
            onClick={loadConversations}
            disabled={loading}
          >
            {loading ? 'Loading...' : '↻ Refresh'}
          </button>
        </header>

        {error && (
          <div className="creator-admin-messages-error" role="alert">
            <strong>Something went wrong</strong>
            <span>{error}</span>
          </div>
        )}

        <section className="creator-admin-inbox">
          <div className="creator-admin-inbox-heading">
            <div>
              <p className="creator-admin-messages-eyebrow">
                Private Communication
              </p>

              <h2>Your Admin Inbox</h2>

              <p>
                Messages and replies between you and the Marketplace
                Admin.
              </p>
            </div>

            <span className="creator-admin-inbox-count">
              {totalUnread > 0
                ? `${totalUnread} unread`
                : `${conversations.length} conversations`}
            </span>
          </div>

          {loading ? (
            <div className="creator-admin-loading">
              <span className="creator-admin-spinner" />
              <strong>Loading your messages...</strong>
            </div>
          ) : conversations.length === 0 ? (
            <div className="creator-admin-empty">
              <div className="creator-admin-empty-icon">✉️</div>
              <h3>No Admin messages yet</h3>
              <p>
                When the Marketplace Admin sends you a private
                message, it will appear here.
              </p>
            </div>
          ) : (
            <div className="creator-admin-workspace">
              <aside className="creator-admin-sidebar">
                <div className="creator-admin-list-heading">
                  <strong>Conversations</strong>
                  <span>{conversations.length}</span>
                </div>

                <div className="creator-admin-list">
                  {conversations.map((conversation) => (
                    <button
                      type="button"
                      key={conversation.id}
                      className={
                        selectedConversation?.id === conversation.id
                          ? 'creator-admin-conversation selected'
                          : 'creator-admin-conversation'
                      }
                      onClick={() => openConversation(conversation.id)}
                    >
                      <span className="creator-admin-avatar">A</span>

                      <span className="creator-admin-conversation-info">
                        <strong>
                          {conversation.adminName || 'Marketplace Admin'}
                        </strong>

                        <small>
                          {conversation.lastMessage || 'Open conversation'}
                        </small>
                      </span>

                      {conversation.recipientUnreadCount > 0 && (
                        <span className="creator-admin-unread">
                          {conversation.recipientUnreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </aside>

              <div className="creator-admin-chat">
                {!selectedConversation ? (
                  <div className="creator-admin-welcome">
                    <div>💬</div>
                    <h3>Your Admin Inbox</h3>
                    <p>
                      Select a conversation to view messages from the
                      Marketplace Admin.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="creator-admin-chat-header">
                      <span className="creator-admin-avatar">A</span>

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
                            ? 'creator-admin-status closed'
                            : 'creator-admin-status'
                        }
                      >
                        {selectedConversation.status || 'OPEN'}
                      </span>
                    </div>

                    <div className="creator-admin-chat-messages">
                      {loadingConversation ? (
                        <div className="creator-admin-chat-loading">
                          Loading conversation...
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="creator-admin-no-messages">
                          <strong>No messages yet</strong>
                          <span>
                            Your conversation with Admin will appear here.
                          </span>
                        </div>
                      ) : (
                        messages.map((item) => {
                          const isCreator = item.senderRole === 'CREATOR'

                          return (
                            <div
                              key={item.id}
                              className={
                                isCreator
                                  ? 'creator-admin-message-row own'
                                  : 'creator-admin-message-row'
                              }
                            >
                              <div
                                className={
                                  isCreator
                                    ? 'creator-admin-message-bubble own'
                                    : 'creator-admin-message-bubble'
                                }
                              >
                                <span className="creator-admin-message-role">
                                  {isCreator ? 'You' : 'Marketplace Admin'}
                                </span>

                                <p>{item.text}</p>

                                <time>{formatTime(item.createdAt)}</time>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {selectedConversation.status === 'CLOSED' ? (
                      <div className="creator-admin-closed">
                        <strong>This conversation is closed.</strong>
                        <span>You cannot send new replies.</span>
                      </div>
                    ) : (
                      <form
                        className="creator-admin-composer"
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

                        <div className="creator-admin-composer-footer">
                          <span>{messageText.length}/2000</span>

                          <button
                            type="submit"
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
      </section>
    </main>
  )
}

export default CreatorAdminMessagesPage
