import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './BuyerConversationPage.css'


export function BuyerConversationPage() {
  const auth = useAuth()
  const { conversationId } = useParams()

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


  useEffect(() => {
    async function loadConversation() {
      if (!auth.token) {
        setLoading(false)
        setError(
          'Authentication is required.',
        )
        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          `/chat/conversations/${encodeURIComponent(
            conversationId,
          )}`,
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

        await apiRequest(
          `/chat/conversations/${encodeURIComponent(
            conversationId,
          )}/read`,
          {
            method: 'PATCH',
            token: auth.token,
          },
        )
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load this conversation.',
        )
      } finally {
        setLoading(false)
      }
    }

    if (conversationId) {
      loadConversation()
    }
  }, [
    auth.token,
    conversationId,
  ])


  async function handleSendMessage(
    event,
  ) {
    event.preventDefault()

    const text =
      messageText.trim()

    if (!text || sending) {
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

      const data = await apiRequest(
        `/chat/conversations/${encodeURIComponent(
          conversationId,
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


  function isOwnMessage(message) {
    return (
      message.senderId ===
      auth.user?.id
    )
  }


  if (loading) {
    return (
      <main className="buyer-conversation-shell">

        <section className="buyer-conversation-container">

          <div className="buyer-conversation-loading">

            <div className="buyer-conversation-spinner" />

            <strong>
              Loading conversation...
            </strong>

          </div>

        </section>

      </main>
    )
  }


  if (error && !conversation) {
    return (
      <main className="buyer-conversation-shell">

        <section className="buyer-conversation-container">

          <div className="buyer-conversation-error">

            <strong>
              Unable to open conversation
            </strong>

            <span>
              {error}
            </span>

            <Link
              to="/buyer/chat"
              className="buyer-conversation-back-button"
            >
              ← Back to Messages
            </Link>

          </div>

        </section>

      </main>
    )
  }


  return (
    <main className="buyer-conversation-shell">

      <section className="buyer-conversation-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="buyer-conversation-header">

          <div>

            <Link
              to="/buyer/chat"
              className="buyer-conversation-back-link"
            >
              ← Messages
            </Link>

            <p className="buyer-eyebrow">
              Creator Support
            </p>

            <h1>
              {conversation?.productName ||
                'Purchased Website'}
            </h1>

            <p>
              Creator:{' '}
              <strong>
                {conversation?.creatorName ||
                  'Website Creator'}
              </strong>
            </p>

          </div>

        </header>


        {/* =====================================================
            CHAT
        ===================================================== */}

        <section className="buyer-conversation-card">

          <div className="buyer-conversation-meta">

            <span>
              Order #{conversation?.orderId}
            </span>

            <span>
              {conversation?.status ||
                'OPEN'}
            </span>

          </div>


          <div className="buyer-message-list">

            {messages.length === 0 && (

              <div className="buyer-no-messages">

                <div>
                  💬
                </div>

                <strong>
                  Start the conversation
                </strong>

                <span>
                  Ask the creator anything about
                  your purchased website.
                </span>

              </div>

            )}


            {messages.map(
              (message) => {

                const own =
                  isOwnMessage(
                    message,
                  )

                return (
                  <div
                    key={message.id}
                    className={
                      own
                        ? 'buyer-message-row buyer-message-row-own'
                        : 'buyer-message-row'
                    }
                  >

                    <div
                      className={
                        own
                          ? 'buyer-message-bubble buyer-message-bubble-own'
                          : 'buyer-message-bubble'
                      }
                    >

                      <span>
                        {message.text}
                      </span>

                      <small>
                        {formatTime(
                          message.createdAt,
                        )}
                      </small>

                    </div>

                  </div>
                )
              },
            )}

          </div>


          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (

            <div className="buyer-conversation-inline-error">
              {error}
            </div>

          )}


          {/* ===================================================
              COMPOSER
          =================================================== */}

          <form
            className="buyer-message-composer"
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
              placeholder="Ask the creator about your purchased website..."
              maxLength={2000}
              rows={3}
              disabled={sending}
            />

            <div className="buyer-message-composer-footer">

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
                  : 'Send Message →'}
              </button>

            </div>

          </form>

        </section>

      </section>

    </main>
  )
}