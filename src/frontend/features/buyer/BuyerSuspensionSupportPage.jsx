import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './BuyerSuspensionSupportPage.css'


export function BuyerSuspensionSupportPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [conversation, setConversation] =
    useState(null)

  const [messages, setMessages] =
    useState([])

  const [messageText, setMessageText] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [sending, setSending] =
    useState(false)

  const [error, setError] =
    useState('')


  // =========================================================
  // LOAD / CREATE SUPPORT CONVERSATION
  // =========================================================

  useEffect(() => {
    async function loadConversation() {
      if (!auth.token) {
        setLoading(false)
        setError(
          'Authentication is required.',
        )
        return
      }

      if (!auth.user?.suspended) {
        navigate(
          '/buyer/dashboard',
          {
            replace: true,
          },
        )
        return
      }

      try {
        setLoading(true)
        setError('')

        const conversationData =
          await apiRequest(
            '/chat/suspension-support/conversation',
            {
              method: 'GET',
              token: auth.token,
            },
          )

        const supportConversation =
          conversationData?.conversation ??
          null

        setConversation(
          supportConversation,
        )

        if (!supportConversation?.id) {
          throw new Error(
            'Unable to create the support conversation.',
          )
        }

        const data =
          await apiRequest(
            `/chat/suspension-support/conversations/${encodeURIComponent(
              supportConversation.id,
            )}`,
            {
              method: 'GET',
              token: auth.token,
            },
          )

        setConversation(
          data?.conversation ??
            supportConversation,
        )

        setMessages(
          Array.isArray(data?.messages)
            ? data.messages
            : [],
        )

        await apiRequest(
          `/chat/suspension-support/conversations/${encodeURIComponent(
            supportConversation.id,
          )}/read`,
          {
            method: 'PATCH',
            token: auth.token,
          },
        )
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to open support chat.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadConversation()
  }, [
    auth.token,
    auth.user?.suspended,
    navigate,
  ])


  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function handleSendMessage(
    event,
  ) {
    event.preventDefault()

    const text =
      messageText.trim()

    if (
      !text ||
      sending ||
      !conversation?.id
    ) {
      return
    }

    if (!auth.token) {
      setError(
        'Authentication is required.',
      )
      return
    }

    try {
      setSending(true)
      setError('')

      const data =
        await apiRequest(
          `/chat/suspension-support/conversations/${encodeURIComponent(
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


  // =========================================================
  // HELPERS
  // =========================================================

  function formatTime(value) {
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


  function isOwnMessage(message) {
    return (
      message?.senderId ===
      auth.user?.id
    )
  }


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <main className="buyer-support-shell">

        <section className="buyer-support-container">

          <div className="buyer-support-loading">

            <div className="buyer-support-spinner" />

            <strong>
              Opening support chat...
            </strong>

          </div>

        </section>

      </main>
    )
  }


  // =========================================================
  // MAIN RENDER
  // =========================================================

  return (
    <main className="buyer-support-shell">

      <section className="buyer-support-container">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="buyer-support-header">

          <div>

            <p className="buyer-support-eyebrow">
              Account Support
            </p>

            <h1>
              Contact Admin
            </h1>

            <p>
              Send a message to the Marketplace
              administrator about your suspended
              account.
            </p>

          </div>


          <Link
            to="/buyer/dashboard"
            className="buyer-support-back-button"
          >
            ← Dashboard
          </Link>

        </header>


        {/* =====================================================
            SUSPENSION INFORMATION
        ===================================================== */}

        <section className="buyer-support-suspension">

          <div className="buyer-support-warning-icon">
            !
          </div>


          <div>

            <span>
              Account Suspended
            </span>

            <strong>
              {auth.user?.suspensionReason ||
                'No specific reason was provided.'}
            </strong>

          </div>

        </section>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="buyer-support-error">
            {error}
          </div>

        )}


        {/* =====================================================
            CHAT
        ===================================================== */}

        <section className="buyer-support-chat">


          {/* ===================================================
              CHAT HEADER
          =================================================== */}

          <div className="buyer-support-chat-header">

            <div>

              <strong>
                Marketplace Admin
              </strong>

              <span>
                Suspension support
              </span>

            </div>


            <span
              className={`buyer-support-status ${
                conversation?.status ===
                'CLOSED'
                  ? 'buyer-support-status-closed'
                  : ''
              }`}
            >
              {conversation?.status ||
                'OPEN'}
            </span>

          </div>


          {/* ===================================================
              MESSAGES
          =================================================== */}

          <div className="buyer-support-messages">

            {messages.length === 0 ? (

              <div className="buyer-support-empty">

                <strong>
                  Start the conversation
                </strong>

                <span>
                  Explain your issue or ask the
                  administrator for help with your
                  suspended account.
                </span>

              </div>

            ) : (

              messages.map(
                (message) => {

                  const own =
                    isOwnMessage(
                      message,
                    )

                  return (
                    <div
                      key={
                        message.id
                      }
                      className={`buyer-support-message-row ${
                        own
                          ? 'buyer-support-message-row-own'
                          : ''
                      }`}
                    >

                      <div className="buyer-support-message">

                        <div className="buyer-support-message-meta">

                          <strong>
                            {own
                              ? 'You'
                              : 'Admin'}
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
                },
              )

            )}

          </div>


          {/* ===================================================
              MESSAGE COMPOSER
          =================================================== */}

          {conversation?.status ===
          'CLOSED' ? (

            <div className="buyer-support-closed-message">
              This support conversation has been
              closed.
            </div>

          ) : (

            <form
              className="buyer-support-composer"
              onSubmit={
                handleSendMessage
              }
            >

              <textarea
                value={
                  messageText
                }
                onChange={(
                  event,
                ) =>
                  setMessageText(
                    event.target.value,
                  )
                }
                placeholder="Write a message to the administrator..."
                rows={4}
                disabled={
                  sending
                }
              />


              <div className="buyer-support-composer-footer">

                <span>
                  {messageText.trim()
                    .length > 0
                    ? `${messageText.trim().length} characters`
                    : 'Describe your issue clearly'}
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
                    : 'Send Message'}
                </button>

              </div>

            </form>

          )}

        </section>

      </section>

    </main>
  )
}