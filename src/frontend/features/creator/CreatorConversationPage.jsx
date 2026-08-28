import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './CreatorConversationPage.css'


export function CreatorConversationPage() {
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

  const [sendError, setSendError] =
    useState('')

  const messagesEndRef =
    useRef(null)


  // =========================================================
  // LOAD CONVERSATION + MESSAGES
  // =========================================================

  useEffect(() => {
    async function loadConversation() {
      if (!auth.token || !conversationId) {
        setLoading(false)
        setError(
          'Authentication or conversation is missing.',
        )
        return
      }

      try {
        setLoading(true)
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
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load this conversation.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadConversation()
  }, [
    auth.token,
    conversationId,
  ])


  // =========================================================
  // MARK CONVERSATION AS READ
  // =========================================================

  useEffect(() => {
    async function markAsRead() {
      if (
        !auth.token ||
        !conversationId ||
        !conversation
      ) {
        return
      }

      try {
        await apiRequest(
          `/chat/conversations/${conversationId}/read`,
          {
            method: 'PATCH',
            token: auth.token,
          },
        )
      } catch {
        // Read status should not block the chat UI.
      }
    }

    markAsRead()
  }, [
    auth.token,
    conversationId,
    conversation,
  ])


  // =========================================================
  // SCROLL TO LATEST MESSAGE
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])


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


  function getBuyerEmail() {
    return (
      conversation?.buyer?.email ||
      conversation?.buyerEmail ||
      ''
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


  function isClosed() {
    return (
      conversation?.status === 'CLOSED' ||
      conversation?.closed === true
    )
  }


  function getMessageContent(message) {
    return (
      message?.text ||
      message?.content ||
      message?.message ||
      ''
    )
  }


  function getMessageDate(message) {
    return (
      message?.createdAt ||
      message?.sentAt ||
      message?.timestamp
    )
  }


  function formatMessageDate(value) {
    if (!value) {
      return ''
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }


  /*
   * IMPORTANT:
   *
   * The database already stores the correct
   * senderRole for every message.
   *
   * CREATOR = message belongs to the creator
   * BUYER   = message belongs to the buyer
   *
   * Therefore the Creator UI uses senderRole
   * directly instead of guessing from the
   * authenticated user ID.
   */
  function isCreatorMessage(message) {
    return (
      message?.senderRole
        ?.toString()
        .toUpperCase() === 'CREATOR'
    )
  }


  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function handleSendMessage(event) {
    event.preventDefault()

    const trimmedMessage =
      messageText.trim()

    if (
      !trimmedMessage ||
      sending ||
      isClosed()
    ) {
      return
    }

    try {
      setSending(true)
      setSendError('')

      const data = await apiRequest(
        `/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          token: auth.token,
          body: {
            text: trimmedMessage,
          },
        },
      )

      /*
       * Add the newly-created message
       * to the existing message list.
       */
      if (data?.message) {
        setMessages(
          (currentMessages) => [
            ...currentMessages,
            data.message,
          ],
        )
      }

      /*
       * Update conversation metadata.
       *
       * IMPORTANT:
       * The POST endpoint returns `conversation`,
       * not a complete `messages` array.
       *
       * Therefore we must NOT replace messages
       * with data.messages here.
       */
      if (data?.conversation) {
        setConversation(
          data.conversation,
        )
      }

      setMessageText('')
    } catch (requestError) {
      setSendError(
        requestError?.message ||
          'Unable to send your message.',
      )
    } finally {
      setSending(false)
    }
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="creator-conversation-shell">

        <section className="creator-conversation-container">

          <div className="creator-conversation-loading">

            <div className="creator-conversation-spinner" />

            <div>

              <strong>
                Loading conversation
              </strong>

              <span>
                Please wait while we load your
                conversation.
              </span>

            </div>

          </div>

        </section>

      </main>
    )
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error || !conversation) {
    return (
      <main className="creator-conversation-shell">

        <section className="creator-conversation-container">

          <div className="creator-conversation-error">

            <div className="creator-conversation-error-icon">
              !
            </div>

            <div>

              <strong>
                Unable to open conversation
              </strong>

              <span>
                {error ||
                  'This conversation could not be found.'}
              </span>

              <Link
                to="/creator/chat"
                className="creator-conversation-back-button"
              >
                ← Back to Messages
              </Link>

            </div>

          </div>

        </section>

      </main>
    )
  }


  const closed =
    isClosed()


  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <main className="creator-conversation-shell">

      <section className="creator-conversation-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="creator-conversation-header">

          <div>

            <Link
              to="/creator/chat"
              className="creator-conversation-back"
            >
              ← Messages
            </Link>

            <p className="creator-conversation-eyebrow">
              Buyer Conversation
            </p>

            <h1>
              {getBuyerName()}
            </h1>

            {getBuyerEmail() && (

              <p className="creator-conversation-email">
                {getBuyerEmail()}
              </p>

            )}

          </div>


          <div className="creator-conversation-status">

            <span>
              {closed
                ? 'Closed'
                : 'Open'}
            </span>

          </div>

        </header>


        {/* =================================================
            ORDER / PRODUCT CONTEXT
        ================================================= */}

        <section className="creator-conversation-context">

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
              Conversation
            </span>

            <strong>
              {conversationId}
            </strong>

          </div>

        </section>


        {/* =================================================
            CHAT PANEL
        ================================================= */}

        <section className="creator-conversation-panel">

          <div className="creator-conversation-panel-header">

            <div>

              <span>
                Direct Messages
              </span>

              <strong>
                {messages.length}{' '}
                {messages.length === 1
                  ? 'message'
                  : 'messages'}
              </strong>

            </div>

            <div className="creator-conversation-security">
              Order-linked chat
            </div>

          </div>


          {/* ===============================================
              MESSAGES
          =============================================== */}

          <div className="creator-conversation-messages">

            {messages.length === 0 && (

              <div className="creator-conversation-no-messages">

                <div>
                  💬
                </div>

                <strong>
                  No messages yet
                </strong>

                <span>
                  Send a message to start the
                  conversation with the buyer.
                </span>

              </div>

            )}


            {messages.map(
              (message, index) => {

                const creatorMessage =
                  isCreatorMessage(message)

                return (
                  <div
                    key={
                      message?.id ||
                      message?._id ||
                      index
                    }
                    className={
                      creatorMessage
                        ? 'creator-conversation-message creator-conversation-message-creator'
                        : 'creator-conversation-message creator-conversation-message-buyer'
                    }
                  >

                    <div className="creator-conversation-message-bubble">

                      <div className="creator-conversation-message-label">

                        {creatorMessage
                          ? 'You'
                          : getBuyerName()}

                      </div>

                      <p>
                        {getMessageContent(
                          message,
                        )}
                      </p>

                      <time>
                        {formatMessageDate(
                          getMessageDate(
                            message,
                          ),
                        )}
                      </time>

                    </div>

                  </div>
                )
              },
            )}

            <div
              ref={messagesEndRef}
            />

          </div>


          {/* ===============================================
              SEND ERROR
          =============================================== */}

          {sendError && (

            <div className="creator-conversation-send-error">
              {sendError}
            </div>

          )}


          {/* ===============================================
              COMPOSER
          =============================================== */}

          {closed ? (

            <div className="creator-conversation-closed">

              <span>
                This conversation is closed.
              </span>

            </div>

          ) : (

            <form
              className="creator-conversation-composer"
              onSubmit={handleSendMessage}
            >

              <textarea
                value={messageText}
                onChange={(event) =>
                  setMessageText(
                    event.target.value,
                  )
                }
                placeholder="Write a message to the buyer..."
                rows={3}
                maxLength={2000}
                disabled={sending}
              />


              <div className="creator-conversation-composer-bottom">

                <span>
                  {messageText.length}/2000
                </span>

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !messageText.trim()
                  }
                  className="creator-conversation-send"
                >
                  {sending
                    ? 'Sending...'
                    : 'Send Message →'}
                </button>

              </div>

            </form>

          )}

        </section>

      </section>

    </main>
  )
}