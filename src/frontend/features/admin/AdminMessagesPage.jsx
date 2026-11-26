
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'

import './admin.css'
import './AdminMessagesPage.css'

function AdminMessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('announcements')

  // Announcements
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  // Direct messages
  const [recipients, setRecipients] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')
  const [loadingDirect, setLoadingDirect] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [sending, setSending] = useState(false)
  const [startingConversation, setStartingConversation] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { token } = useAuth()
  const navigate = useNavigate()

  // =========================================================
  // LOAD ANNOUNCEMENTS
  // =========================================================

  useEffect(() => {
    let isMounted = true

    async function fetchAnnouncements() {
      if (!token) {
        setLoading(false)
        setError('Authentication token is unavailable.')
        return
      }

      try {
        setLoading(true)

        const data = await apiRequest('/admin/announcements', {
          method: 'GET',
          token,
        })

        if (isMounted) {
          setAnnouncements(
            Array.isArray(data?.announcements)
              ? data.announcements
              : [],
          )
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.message || 'Unable to load announcements.',
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAnnouncements()

    return () => {
      isMounted = false
    }
  }, [token])

  async function loadAnnouncements() {
    if (!token) return

    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/admin/announcements', {
        method: 'GET',
        token,
      })

      setAnnouncements(
        Array.isArray(data?.announcements)
          ? data.announcements
          : [],
      )
    } catch (requestError) {
      setError(
        requestError?.message || 'Unable to load announcements.',
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // PUBLISH ANNOUNCEMENT
  // =========================================================

  async function publishAnnouncement(event) {
    event.preventDefault()

    if (!token || publishing) return

    const cleanTitle = title.trim()
    const cleanMessage = message.trim()

    if (!cleanTitle || !cleanMessage) {
      setError('Please enter both title and message.')
      return
    }

    try {
      setPublishing(true)
      setError('')
      setSuccess('')

      const data = await apiRequest('/admin/announcements', {
        method: 'POST',
        token,
        body: {
          title: cleanTitle,
          message: cleanMessage,
        },
      })

      if (data?.announcement) {
        setAnnouncements((current) => [
          data.announcement,
          ...current,
        ])
      } else {
        await loadAnnouncements()
      }

      setTitle('')
      setMessage('')

      setSuccess(
        `Announcement published successfully. ${
          data?.totalRecipients ?? 0
        } recipients found.`,
      )
    } catch (requestError) {
      setError(
        requestError?.message || 'Unable to publish announcement.',
      )
    } finally {
      setPublishing(false)
    }
  }

  // =========================================================
  // LOAD DIRECT MESSAGE DATA
  // =========================================================

  async function loadDirectMessages() {
    if (!token) return

    try {
      setLoadingDirect(true)
      setError('')

      const [recipientData, conversationData] = await Promise.all([
        apiRequest('/admin/chat/direct-message-recipients', {
          method: 'GET',
          token,
        }),
        apiRequest('/admin/chat/direct-messages', {
          method: 'GET',
          token,
        }),
      ])

      setRecipients(
        Array.isArray(recipientData?.recipients)
          ? recipientData.recipients
          : [],
      )

      setConversations(
        Array.isArray(conversationData?.conversations)
          ? conversationData.conversations
          : [],
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to load direct messages.',
      )
    } finally {
      setLoadingDirect(false)
    }
  }

  useEffect(() => {
    if (activeTab !== 'direct' || !token) return

    let isMounted = true

    async function fetchDirectMessages() {
      try {
        setLoadingDirect(true)
        setError('')

        const [recipientData, conversationData] = await Promise.all([
          apiRequest('/admin/chat/direct-message-recipients', {
            method: 'GET',
            token,
          }),
          apiRequest('/admin/chat/direct-messages', {
            method: 'GET',
            token,
          }),
        ])

        if (!isMounted) return

        setRecipients(
          Array.isArray(recipientData?.recipients)
            ? recipientData.recipients
            : [],
        )

        setConversations(
          Array.isArray(conversationData?.conversations)
            ? conversationData.conversations
            : [],
        )
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.message ||
              'Unable to load direct messages.',
          )
        }
      } finally {
        if (isMounted) setLoadingDirect(false)
      }
    }

    fetchDirectMessages()

    return () => {
      isMounted = false
    }
  }, [activeTab, token])

  // =========================================================
  // OPEN A CONVERSATION
  // =========================================================

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
        requestError?.message ||
          'Unable to open this conversation.',
      )
    } finally {
      setLoadingConversation(false)
    }
  }

  // =========================================================
  // START A CONVERSATION
  // =========================================================

  async function startConversation(recipient) {
    if (!token || startingConversation) return

    try {
      setStartingConversation(true)
      setError('')
      setSuccess('')

      const data = await apiRequest('/admin/chat/direct-messages', {
        method: 'POST',
        token,
        body: {
          recipientId: recipient.id,
        },
      })

      const conversation = data?.conversation

      if (!conversation?.id) {
        throw new Error('Unable to create the conversation.')
      }

      setConversations((current) => {
        const exists = current.some(
          (item) => item.id === conversation.id,
        )

        return exists
          ? current.map((item) =>
              item.id === conversation.id ? conversation : item,
            )
          : [conversation, ...current]
      })

      await openConversation(conversation.id)
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to start this conversation.',
      )
    } finally {
      setStartingConversation(false)
    }
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function sendDirectMessage(event) {
    event.preventDefault()

    const cleanText = messageText.trim()

    if (
      !token ||
      !selectedConversation?.id ||
      !cleanText ||
      sending
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
        setMessages((current) => [
          ...current,
          data.message,
        ])
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

  // =========================================================
  // HELPERS
  // =========================================================

  function formatDate(value) {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return '—'

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  const filteredRecipients = recipients.filter((recipient) => {
    const search = searchTerm.trim().toLowerCase()

    return (
      recipient.name?.toLowerCase().includes(search) ||
      recipient.role?.toLowerCase().includes(search)
    )
  })

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay visible"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="admin-main">
        <AdminTopbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="admin-content">
          <section className="admin-page-header">
            <div className="admin-page-header-copy">
              <span className="admin-eyebrow">
                Marketplace Communication
              </span>

              <h1>Messages</h1>

              <p>
                Manage marketplace announcements and communicate
                directly with Buyers and Creators.
              </p>
            </div>

            <div className="admin-header-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => navigate('/admin/dashboard')}
              >
                Dashboard
              </button>
            </div>
          </section>

          {error && (
            <div className="admin-dashboard-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="admin-messages-success" role="status">
              {success}
            </div>
          )}

          {/* TABS */}

          <section className="admin-messages-tabs">
            <button
              type="button"
              className={
                activeTab === 'announcements'
                  ? 'admin-messages-tab active'
                  : 'admin-messages-tab'
              }
              onClick={() => {
                setActiveTab('announcements')
                setError('')
                setSuccess('')
              }}
            >
              <span>📢</span>
              Announcements
            </button>

            <button
              type="button"
              className={
                activeTab === 'direct'
                  ? 'admin-messages-tab active'
                  : 'admin-messages-tab'
              }
              onClick={() => {
                setActiveTab('direct')
                setError('')
                setSuccess('')
              }}
            >
              <span>✉️</span>
              Direct Messages
            </button>
          </section>

          {/* ANNOUNCEMENTS */}

          {activeTab === 'announcements' && (
            <div className="admin-messages-content">
              <section className="admin-panel admin-message-compose">
                <div className="admin-panel-header">
                  <div>
                    <span className="admin-panel-eyebrow">
                      Broadcast Message
                    </span>
                    <h2>Create Announcement</h2>
                  </div>

                  <span className="admin-message-audience">
                    Buyers + Creators
                  </span>
                </div>

                <p className="admin-message-description">
                  Your announcement will be delivered as a
                  notification to all registered Buyers and Creators.
                </p>

                <form onSubmit={publishAnnouncement}>
                  <div className="admin-message-field">
                    <label htmlFor="announcement-title">
                      Announcement Title
                    </label>

                    <input
                      id="announcement-title"
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Enter announcement title"
                      maxLength={120}
                      required
                    />

                    <span>{title.length}/120</span>
                  </div>

                  <div className="admin-message-field">
                    <label htmlFor="announcement-message">
                      Announcement Message
                    </label>

                    <textarea
                      id="announcement-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Write your announcement here..."
                      rows={6}
                      maxLength={2000}
                      required
                    />

                    <span>{message.length}/2000</span>
                  </div>

                  <div className="admin-message-compose-footer">
                    <p>
                      <span>ⓘ</span>
                      This announcement will be sent to both user roles.
                    </p>

                    <button
                      type="submit"
                      className="admin-message-publish-button"
                      disabled={publishing}
                    >
                      {publishing
                        ? 'Publishing...'
                        : 'Publish Announcement →'}
                    </button>
                  </div>
                </form>
              </section>

              <section className="admin-panel admin-message-history">
                <div className="admin-panel-header">
                  <div>
                    <span className="admin-panel-eyebrow">
                      Message History
                    </span>
                    <h2>Published Announcements</h2>
                  </div>

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={loadAnnouncements}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : '↻ Refresh'}
                  </button>
                </div>

                {loading ? (
                  <div className="admin-message-empty">
                    Loading announcements...
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="admin-message-empty">
                    <div>📢</div>
                    <strong>No announcements yet</strong>
                    <p>
                      Your published announcements will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="admin-announcement-list">
                    {announcements.map((announcement) => (
                      <article
                        className="admin-announcement-item"
                        key={
                          announcement._id || announcement.id
                        }
                      >
                        <div className="admin-announcement-icon">
                          📢
                        </div>

                        <div className="admin-announcement-details">
                          <div className="admin-announcement-heading">
                            <h3>{announcement.title}</h3>
                            <span>
                              {announcement.status || 'PUBLISHED'}
                            </span>
                          </div>

                          <p>{announcement.message}</p>

                          <div className="admin-announcement-meta">
                            <span>Buyers + Creators</span>
                            <span>
                              {formatDate(announcement.createdAt)}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* DIRECT MESSAGES */}

          {activeTab === 'direct' && (
            <section className="admin-panel admin-direct-workspace">
              <div className="admin-direct-heading">
                <div>
                  <span className="admin-panel-eyebrow">
                    One-to-One Communication
                  </span>
                  <h2>Direct Messages</h2>
                  <p>
                    Select a Buyer or Creator to start a private
                    conversation.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={loadDirectMessages}
                  disabled={loadingDirect}
                >
                  {loadingDirect ? 'Loading...' : '↻ Refresh'}
                </button>
              </div>

              <div className="admin-direct-grid">
                {/* RECIPIENTS AND CONVERSATIONS */}

                <aside className="admin-direct-sidebar">
                  <div className="admin-direct-search">
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
                      placeholder="Search Buyers or Creators..."
                      aria-label="Search recipients"
                    />
                  </div>

                  <div className="admin-direct-list-heading">
                    <strong>People</strong>
                    <span>{filteredRecipients.length}</span>
                  </div>

                  <div className="admin-direct-people-list">
                    {loadingDirect ? (
                      <p className="admin-direct-empty">
                        Loading people...
                      </p>
                    ) : filteredRecipients.length === 0 ? (
                      <p className="admin-direct-empty">
                        No matching users found.
                      </p>
                    ) : (
                      filteredRecipients.map((recipient) => {
                        const conversation = conversations.find(
                          (item) =>
                            item.recipientId === recipient.id,
                        )

                        const isSelected =
                          selectedConversation?.recipientId ===
                          recipient.id

                        return (
                          <button
                            type="button"
                            key={recipient.id}
                            className={
                              isSelected
                                ? 'admin-direct-person selected'
                                : 'admin-direct-person'
                            }
                            disabled={startingConversation}
                            onClick={() =>
                              conversation?.id
                                ? openConversation(conversation.id)
                                : startConversation(recipient)
                            }
                          >
                            <span className="admin-direct-avatar">
                              {recipient.name?.charAt(0)?.toUpperCase() ||
                                '?'}
                            </span>

                            <span className="admin-direct-person-info">
                              <strong>{recipient.name}</strong>
                              <small>{recipient.role}</small>
                            </span>

                            {conversation?.adminUnreadCount > 0 && (
                              <span className="admin-direct-unread">
                                {conversation.adminUnreadCount}
                              </span>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>

                  <div className="admin-direct-list-heading">
                    <strong>Recent Conversations</strong>
                    <span>{conversations.length}</span>
                  </div>

                  <div className="admin-direct-conversation-list">
                    {conversations.length === 0 ? (
                      <p className="admin-direct-empty">
                        No conversations yet.
                      </p>
                    ) : (
                      conversations.map((conversation) => (
                        <button
                          type="button"
                          key={conversation.id}
                          className={
                            selectedConversation?.id === conversation.id
                              ? 'admin-direct-conversation selected'
                              : 'admin-direct-conversation'
                          }
                          onClick={() =>
                            openConversation(conversation.id)
                          }
                        >
                          <span className="admin-direct-conversation-info">
                            <strong>{conversation.recipientName}</strong>
                            <small>
                              {conversation.lastMessage ||
                                'Start a conversation'}
                            </small>
                          </span>

                          {conversation.adminUnreadCount > 0 && (
                            <span className="admin-direct-unread">
                              {conversation.adminUnreadCount}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </aside>

                {/* CHAT WINDOW */}

                <div className="admin-direct-chat">
                  {!selectedConversation ? (
                    <div className="admin-direct-welcome">
                      <div>✉️</div>
                      <h3>Your Messages</h3>
                      <p>
                        Choose a Buyer or Creator from the left to
                        start messaging.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="admin-direct-chat-header">
                        <div className="admin-direct-avatar">
                          {selectedConversation.recipientName
                            ?.charAt(0)
                            ?.toUpperCase() || '?'}
                        </div>

                        <div>
                          <strong>
                            {selectedConversation.recipientName}
                          </strong>
                          <small>
                            {selectedConversation.recipientRole}
                          </small>
                        </div>

                        <span
                          className={
                            selectedConversation.status === 'CLOSED'
                              ? 'admin-direct-status closed'
                              : 'admin-direct-status'
                          }
                        >
                          {selectedConversation.status || 'OPEN'}
                        </span>
                      </div>

                      <div className="admin-direct-messages">
                        {loadingConversation ? (
                          <p className="admin-direct-empty">
                            Loading conversation...
                          </p>
                        ) : messages.length === 0 ? (
                          <div className="admin-direct-welcome">
                            <div>💬</div>
                            <h3>Start the conversation</h3>
                            <p>
                              Send your first message to{' '}
                              {selectedConversation.recipientName}.
                            </p>
                          </div>
                        ) : (
                          messages.map((item) => {
                            const isAdmin =
                              item.senderRole === 'ADMIN'

                            return (
                              <div
                                key={item.id}
                                className={
                                  isAdmin
                                    ? 'admin-direct-message-row own'
                                    : 'admin-direct-message-row'
                                }
                              >
                                <div
                                  className={
                                    isAdmin
                                      ? 'admin-direct-message-bubble own'
                                      : 'admin-direct-message-bubble'
                                  }
                                >
                                  <p>{item.text}</p>
                                  <small>
                                    {isAdmin ? 'You' : item.senderRole}
                                    {' · '}
                                    {formatTime(item.createdAt)}
                                  </small>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      <form
                        className="admin-direct-compose"
                        onSubmit={sendDirectMessage}
                      >
                        <textarea
                          value={messageText}
                          onChange={(event) =>
                            setMessageText(event.target.value)
                          }
                          placeholder="Write a message..."
                          rows={2}
                          maxLength={2000}
                          disabled={
                            sending ||
                            selectedConversation.status === 'CLOSED'
                          }
                        />

                        <button
                          type="submit"
                          disabled={
                            sending ||
                            !messageText.trim() ||
                            selectedConversation.status === 'CLOSED'
                          }
                        >
                          {sending ? 'Sending...' : 'Send Message →'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminMessagesPage
export { AdminMessagesPage }
