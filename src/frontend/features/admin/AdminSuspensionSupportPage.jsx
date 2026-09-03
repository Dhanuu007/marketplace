import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './AdminSuspensionSupportPage.css'

export function AdminSuspensionSupportPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { conversationId } = useParams()

  const [conversations, setConversations] = useState([])
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')

  const [loadingList, setLoadingList] = useState(true)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadConversations() {
      if (!auth.token) {
        setLoadingList(false)
        setError('Authentication is required.')
        return
      }

      try {
        setLoadingList(true)
        setError('')

        const data = await apiRequest(
          '/chat/admin/suspension-support/conversations',
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
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load suspension-support conversations.',
        )
      } finally {
        setLoadingList(false)
      }
    }

    loadConversations()
  }, [auth.token])

  useEffect(() => {
    async function loadConversation() {
      if (!auth.token || !conversationId) {
        setConversation(null)
        setMessages([])
        return
      }

      try {
        setLoadingConversation(true)
        setError('')

        const data = await apiRequest(
          `/chat/admin/suspension-support/conversations/${encodeURIComponent(
            conversationId,
          )}`,
          {
            method: 'GET',
            token: auth.token,
          },
        )

        setConversation(data?.conversation ?? null)
        setMessages(
          Array.isArray(data?.messages)
            ? data.messages
            : [],
        )

        await apiRequest(
          `/chat/admin/suspension-support/conversations/${encodeURIComponent(
            conversationId,
          )}/read`,
          {
            method: 'PATCH',
            token: auth.token,
          },
        )

        setConversations((current) =>
          current.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  adminUnreadCount: 0,
                }
              : item,
          ),
        )
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load this support conversation.',
        )
      } finally {
        setLoadingConversation(false)
      }
    }

    loadConversation()
  }, [auth.token, conversationId])

  async function handleSendMessage(event) {
    event.preventDefault()

    const text = messageText.trim()

    if (
      !text ||
      sending ||
      !conversation?.id ||
      conversation.status === 'CLOSED'
    ) {
      return
    }

    if (!auth.token) {
      setError('Authentication is required.')
      return
    }

    try {
      setSending(true)
      setError('')

      const data = await apiRequest(
        `/chat/admin/suspension-support/conversations/${encodeURIComponent(
          conversation.id,
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
        setMessages((currentMessages) => [
          ...currentMessages,
          data.message,
        ])
      }

      if (data?.conversation) {
        setConversation(data.conversation)

        setConversations((current) =>
          current.map((item) =>
            item.id === data.conversation.id
              ? data.conversation
              : item,
          ),
        )
      }

      setMessageText('')
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to send your reply.',
      )
    } finally {
      setSending(false)
    }
  }

  function formatTime(value) {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getRoleLabel(role) {
    if (role === 'CREATOR') return 'Creator'
    if (role === 'BUYER') return 'Buyer'
    return role || 'User'
  }

  function isOwnMessage(message) {
    return message?.senderId === auth.user?.id
  }

  function handleSelectConversation(id) {
    navigate(
      `/admin/suspension-support/${encodeURIComponent(id)}`,
    )
  }

  return (
    <main className="admin-suspension-support-shell">
      <section className="admin-suspension-support-container">
        <header className="admin-suspension-support-header">
          <div>
            <p className="admin-suspension-support-eyebrow">
              Account Support
            </p>

            <h1>Suspension Support</h1>

            <p>
              Respond directly to suspended Buyer and
              Creator accounts.
            </p>
          </div>

          <Link
            to="/admin/chat"
            className="admin-suspension-support-back"
          >
            ← Back to Chat
          </Link>
        </header>

        {error && (
          <div
            className="admin-suspension-support-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="admin-suspension-support-layout">
          <aside className="admin-suspension-support-sidebar">
            <div className="admin-suspension-support-sidebar-header">
              <div>
                <span>Support Requests</span>
                <strong>
                  {conversations.length}
                </strong>
              </div>
            </div>

            <div className="admin-suspension-support-conversation-list">
              {loadingList ? (
                <div className="admin-suspension-support-list-state">
                  Loading support requests...
                </div>
              ) : conversations.length === 0 ? (
                <div className="admin-suspension-support-list-state">
                  No suspension-support requests yet.
                </div>
              ) : (
                conversations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`admin-suspension-support-conversation-item ${
                      item.id === conversationId
                        ? 'admin-suspension-support-conversation-item-active'
                        : ''
                    }`}
                    onClick={() =>
                      handleSelectConversation(
                        item.id,
                      )
                    }
                  >
                    <div className="admin-suspension-support-conversation-top">
                      <strong>
                        {item.userName ||
                          'Suspended User'}
                      </strong>

                      <span>
                        {getRoleLabel(
                          item.userRole,
                        )}
                      </span>
                    </div>

                    <p>
                      {item.lastMessage ||
                        'No messages yet.'}
                    </p>

                    <div className="admin-suspension-support-conversation-bottom">
                      <small>
                        {formatTime(
                          item.lastMessageAt,
                        )}
                      </small>

                      {item.adminUnreadCount > 0 && (
                        <b>
                          {item.adminUnreadCount}
                        </b>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="admin-suspension-support-chat">
            {!conversationId ? (
              <div className="admin-suspension-support-empty-chat">
                <div className="admin-suspension-support-empty-icon">
                  💬
                </div>

                <h2>Select a support request</h2>

                <p>
                  Choose a suspended Buyer or Creator
                  from the list to view the conversation
                  and respond.
                </p>
              </div>
            ) : loadingConversation ? (
              <div className="admin-suspension-support-empty-chat">
                <div className="admin-suspension-support-spinner" />
                <p>Loading conversation...</p>
              </div>
            ) : !conversation ? (
              <div className="admin-suspension-support-empty-chat">
                <h2>Conversation unavailable</h2>
                <p>
                  This suspension-support conversation
                  could not be loaded.
                </p>
              </div>
            ) : (
              <>
                <header className="admin-suspension-support-chat-header">
                  <div>
                    <p>
                      Suspension Support
                    </p>

                    <h2>
                      {conversation.userName ||
                        'Suspended User'}
                    </h2>

                    <span>
                      {getRoleLabel(
                        conversation.userRole,
                      )}{' '}
                      · Suspended
                    </span>
                  </div>

                  <div
                    className={`admin-suspension-support-chat-status ${
                      conversation.status ===
                      'CLOSED'
                        ? 'admin-suspension-support-chat-status-closed'
                        : ''
                    }`}
                  >
                    {conversation.status ===
                    'CLOSED'
                      ? 'Closed'
                      : 'Open'}
                  </div>
                </header>

                <div className="admin-suspension-support-messages">
                  {messages.length === 0 ? (
                    <div className="admin-suspension-support-empty-messages">
                      <strong>
                        No messages yet
                      </strong>

                      <p>
                        The suspended user has not
                        sent a message yet.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const own =
                        isOwnMessage(message)

                      return (
                        <div
                          key={message.id}
                          className={`admin-suspension-support-message-row ${
                            own
                              ? 'admin-suspension-support-message-row-own'
                              : ''
                          }`}
                        >
                          <div className="admin-suspension-support-message">
                            <div className="admin-suspension-support-message-meta">
                              <strong>
                                {own
                                  ? 'Admin'
                                  : conversation.userName ||
                                    getRoleLabel(
                                      conversation.userRole,
                                    )}
                              </strong>

                              <span>
                                {formatTime(
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
                    })
                  )}
                </div>

                {conversation.status ===
                'CLOSED' ? (
                  <div className="admin-suspension-support-closed">
                    This support conversation is closed.
                  </div>
                ) : (
                  <form
                    className="admin-suspension-support-composer"
                    onSubmit={
                      handleSendMessage
                    }
                  >
                    <textarea
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(
                          event.target.value,
                        )
                      }
                      placeholder="Type your reply to the suspended user..."
                      rows={3}
                      maxLength={2000}
                      disabled={sending}
                    />

                    <div className="admin-suspension-support-composer-footer">
                      <span>
                        {messageText.length}/2000
                      </span>

                      <button
                        type="submit"
                        disabled={
                          sending ||
                          !messageText.trim()
                        }
                      >
                        {sending
                          ? 'Sending...'
                          : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}