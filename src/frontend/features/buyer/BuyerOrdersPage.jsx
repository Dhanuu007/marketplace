import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './BuyerOrdersPage.css'


export function BuyerOrdersPage() {
  const auth = useAuth()
  const navigate = useNavigate()


  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingDelivery, setDownloadingDelivery] =
    useState('')
  const [openingChat, setOpeningChat] =
    useState('')


  // =========================================================
  // LOAD BUYER ORDERS
  // =========================================================

  useEffect(() => {
    async function loadBuyerOrders() {
      if (!auth.token) {
        setOrders([])
        setLoading(false)
        setError('Authentication is required.')
        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          '/orders',
          {
            method: 'GET',
            token: auth.token,
          },
        )

        setOrders(
          Array.isArray(data?.orders)
            ? data.orders
            : [],
        )
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load your orders.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadBuyerOrders()
  }, [auth.token])


  // =========================================================
  // HELPERS
  // =========================================================

  async function handleDownloadDelivery(
    orderId,
    productId,
    originalFileName,
  ) {
    if (!auth.token) {
      return
    }

    const downloadKey =
      `${orderId}-${productId}`

    try {
      setDownloadingDelivery(downloadKey)

      const response = await fetch(
        `/api/orders/${encodeURIComponent(
          orderId,
        )}/items/${encodeURIComponent(
          productId,
        )}/delivery/download`,
        {
          method: 'GET',
          headers: {
            Authorization:
              `Bearer ${auth.token}`,
          },
        },
      )

      if (!response.ok) {
        let message =
          'Unable to download the website ZIP.'

        try {
          const errorData =
            await response.json()

          if (errorData?.message) {
            message = errorData.message
          }
        } catch {
          // Ignore non-JSON error responses.
        }

        throw new Error(message)
      }

      const blob =
        await response.blob()

      const blobUrl =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = blobUrl

      link.download =
        originalFileName ||
        'website-delivery.zip'

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(
        blobUrl,
      )
    } catch (requestError) {
      window.alert(
        requestError?.message ||
          'Unable to download the website ZIP.',
      )
    } finally {
      setDownloadingDelivery('')
    }
  }


  // =========================================================
  // OPEN CREATOR CHAT
  // =========================================================

  async function handleOpenChat(
  orderId,
  productId,
) {
  if (!auth.token) {
    window.alert(
      'Authentication is required.',
    )

    return
  }

  const chatKey =
    `${orderId}-${productId}`

  try {
    setOpeningChat(chatKey)

    const data = await apiRequest(
      '/chat/conversations',
      {
        method: 'POST',
        token: auth.token,
        body: {
          orderId,
          productId,
        },
      },
    )

    const conversationId =
      data?.conversation?.id

    if (!conversationId) {
      throw new Error(
        'Unable to open the conversation.',
      )
    }

    navigate(
      `/buyer/chat/${conversationId}`,
    )
  } catch (requestError) {
    window.alert(
      requestError?.message ||
        'Unable to open chat with the creator.',
    )
  } finally {
    setOpeningChat('')
  }
}


  // =========================================================
  // CHAT ELIGIBILITY
  // =========================================================

  function canChatWithCreator(
    orderStatus,
  ) {
    return [
      'PAID',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
    ].includes(
      String(
        orderStatus || '',
      ).toUpperCase(),
    )
  }


  function formatCurrency(value) {
    return `₹${Number(
      value || 0,
    ).toLocaleString('en-IN')}`
  }


  function formatDate(value) {
    if (!value) {
      return '—'
    }

    return new Date(value).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
  }


  function getOrderStatusClass(status) {
    return `buyer-order-status buyer-order-status-${String(
      status || 'PENDING',
    ).toLowerCase()}`
  }


  function getDeliveryStatusClass(status) {
    return `buyer-delivery-status buyer-delivery-status-${String(
      status || 'NOT_DELIVERED',
    )
      .toLowerCase()
      .replace(/_/g, '-')}`
  }


  function formatStatus(status) {
    return String(
      status || 'PENDING',
    ).replace(/_/g, ' ')
  }


  // =========================================================
  // STATISTICS
  // =========================================================

  const totalOrders = orders.length

  const totalSpent = orders.reduce(
    (total, order) =>
      total +
      Number(order.totalAmount || 0),
    0,
  )

  const deliveredWebsites = orders.reduce(
    (total, order) =>
      total +
      (order.items ?? []).filter(
        (item) =>
          item.delivery?.status === 'DELIVERED',
      ).length,
    0,
  )

  const pendingWebsites = orders.reduce(
    (total, order) =>
      total +
      (order.items ?? []).filter(
        (item) =>
          item.delivery?.status !== 'DELIVERED',
      ).length,
    0,
  )


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="buyer-orders-shell">

      <section className="buyer-orders-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="buyer-orders-header">

          <div className="buyer-orders-header-copy">

            <p className="buyer-eyebrow">
              Website Purchases
            </p>

            <h1>
              My Orders
            </h1>

            <p className="buyer-orders-welcome">
              View your website purchases, track
              delivery status, and access your
              purchased websites.
            </p>

          </div>


          <div className="buyer-orders-header-actions">

            <Link
              to="/buyer/dashboard"
              className="buyer-orders-secondary-button"
            >
              <span>
                ←
              </span>

              Buyer Dashboard
            </Link>

            <Link
              to="/products"
              className="buyer-orders-primary-button"
            >
              Browse Websites

              <span>
                →
              </span>
            </Link>

          </div>

        </header>


        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="buyer-orders-stats">

          <article className="buyer-order-stat-card">

            <div className="buyer-order-stat-top">

              <span>
                Total Orders
              </span>

              <div className="buyer-order-stat-icon">
                #
              </div>

            </div>

            <strong>
              {totalOrders}
            </strong>

            <small>
              Marketplace purchases
            </small>

          </article>


          <article className="buyer-order-stat-card">

            <div className="buyer-order-stat-top">

              <span>
                Total Spent
              </span>

              <div className="buyer-order-stat-icon">
                ₹
              </div>

            </div>

            <strong>
              {formatCurrency(totalSpent)}
            </strong>

            <small>
              Across all orders
            </small>

          </article>


          <article className="buyer-order-stat-card">

            <div className="buyer-order-stat-top">

              <span>
                Delivered
              </span>

              <div className="buyer-order-stat-icon">
                ✓
              </div>

            </div>

            <strong>
              {deliveredWebsites}
            </strong>

            <small>
              Websites delivered
            </small>

          </article>


          <article className="buyer-order-stat-card">

            <div className="buyer-order-stat-top">

              <span>
                Awaiting Delivery
              </span>

              <div className="buyer-order-stat-icon">
                ◷
              </div>

            </div>

            <strong>
              {pendingWebsites}
            </strong>

            <small>
              Websites awaiting delivery
            </small>

          </article>

        </section>


        {/* =====================================================
            ORDERS SECTION
        ===================================================== */}

        <section className="buyer-orders-section">

          <div className="buyer-orders-section-heading">

            <div>

              <p className="buyer-eyebrow">
                Marketplace Purchases
              </p>

              <h2>
                Your Website Orders
              </h2>

              <p>
                Track your purchases and access
                website delivery information.
              </p>

            </div>


            <span className="buyer-orders-count">

              {orders.length}{' '}

              {orders.length === 1
                ? 'order'
                : 'orders'}

            </span>

          </div>


          {/* ===================================================
              LOADING
          =================================================== */}

          {loading && (

            <div className="buyer-orders-message">

              <div className="buyer-orders-spinner" />

              <div>

                <strong>
                  Loading your orders
                </strong>

                <span>
                  Please wait while we fetch your
                  marketplace purchases.
                </span>

              </div>

            </div>

          )}


          {/* ===================================================
              ERROR
          =================================================== */}

          {!loading &&
            error && (

              <div className="buyer-orders-error">

                <div className="buyer-orders-error-icon">
                  !
                </div>

                <div>

                  <strong>
                    Unable to load orders
                  </strong>

                  <span>
                    {error}
                  </span>

                </div>

              </div>

            )}


          {/* ===================================================
              EMPTY
          =================================================== */}

          {!loading &&
            !error &&
            orders.length === 0 && (

              <div className="buyer-orders-empty">

                <div className="buyer-orders-empty-icon">
                  #
                </div>

                <p className="buyer-eyebrow">
                  Website Purchases
                </p>

                <h3>
                  You haven't purchased a website yet
                </h3>

                <p>
                  Browse the marketplace to discover
                  professionally created websites and
                  make your first purchase.
                </p>

                <Link
                  to="/products"
                  className="buyer-orders-empty-button"
                >
                  Browse Websites

                  <span>
                    →
                  </span>
                </Link>

              </div>

            )}


          {/* ===================================================
              ORDERS
          =================================================== */}

          {!loading &&
            !error &&
            orders.length > 0 && (

              <div className="buyer-orders-list">

                {orders.map((order) => (

                  <article
                    key={order.id}
                    className="buyer-order-card"
                  >

                    {/* =========================================
                        ORDER HEADER
                    ========================================= */}

                    <div className="buyer-order-card-header">

                      <div>

                        <p className="buyer-order-label">
                          Website Purchase
                        </p>

                        <h3>
                          Order #{order.id}
                        </h3>

                        <span className="buyer-order-date">
                          Placed on{' '}

                          {formatDate(
                            order.createdAt,
                          )}
                        </span>

                      </div>


                      <span
                        className={getOrderStatusClass(
                          order.status,
                        )}
                      >

                        <span className="buyer-status-dot" />

                        {formatStatus(
                          order.status,
                        )}

                      </span>

                    </div>


                    {/* =========================================
                        ORDER ITEMS
                    ========================================= */}

                    <div className="buyer-order-items">

                      {(order.items ?? []).map(
                        (item) => (

                          <div
                            key={`${order.id}-${item.productId}`}
                            className="buyer-order-item"
                          >

                            <div className="buyer-order-item-main">

                              {item.image ? (

                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="buyer-order-item-image"
                                />

                              ) : (

                                <div className="buyer-order-item-image buyer-order-item-image-placeholder">
                                  #
                                </div>

                              )}


                              <div className="buyer-order-item-info">

                                <p className="buyer-order-item-label">
                                  Purchased Website
                                </p>

                                <h4>
                                  {item.name}
                                </h4>

                                <p className="buyer-order-creator">
                                  Created by{' '}

                                  <strong>
                                    {item.creatorName ||
                                      'Website Creator'}
                                  </strong>

                                </p>

                              </div>


                              <span
                                className={getDeliveryStatusClass(
                                  item.delivery?.status,
                                )}
                              >

                                <span className="buyer-status-dot" />

                                {formatStatus(
                                  item.delivery?.status,
                                )}

                              </span>

                            </div>


                            {/* =================================
                                ITEM META
                            ================================= */}

                            <div className="buyer-order-item-meta">

                              <div>

                                <span>
                                  Quantity
                                </span>

                                <strong>
                                  {item.quantity}
                                </strong>

                              </div>


                              <div>

                                <span>
                                  Price
                                </span>

                                <strong>
                                  {formatCurrency(
                                    item.price,
                                  )}
                                </strong>

                              </div>


                              <div>

                                <span>
                                  Item Total
                                </span>

                                <strong>
                                  {formatCurrency(
                                    item.itemTotal,
                                  )}
                                </strong>

                              </div>

                            </div>


                            {/* =================================
                                DELIVERY
                            ================================= */}

                            {item.delivery?.status ===
                            'DELIVERED' ? (

                              <div className="buyer-delivered-box">

                                <div className="buyer-delivered-icon">
                                  ✓
                                </div>

                                <div>

                                  <strong>
                                    Website Delivered
                                  </strong>

                                  <span>
                                    Your website is ready
                                    to download.
                                  </span>

                                </div>


                                <button
                                  type="button"
                                  className="buyer-download-button"
                                  onClick={() =>
                                    handleDownloadDelivery(
                                      order.id,
                                      item.productId,
                                      item.websiteZip ||
                                        'website-delivery.zip',
                                    )
                                  }
                                  disabled={
                                    downloadingDelivery ===
                                    `${order.id}-${item.productId}`
                                  }
                                >
                                  {downloadingDelivery ===
                                  `${order.id}-${item.productId}`
                                    ? 'Downloading...'
                                    : 'Download Website'}

                                  <span>
                                    ↓
                                  </span>
                                </button>

                              </div>

                            ) : (

                              <div className="buyer-pending-delivery-box">

                                <div className="buyer-pending-icon">
                                  ◷
                                </div>

                                <div>

                                  <strong>
                                    Delivery Pending
                                  </strong>

                                  <span>
                                    Your purchased website
                                    has not been delivered
                                    yet.
                                  </span>

                                </div>

                              </div>

                            )}


                            {/* =================================
                                CHAT WITH CREATOR
                            ================================= */}

                            {canChatWithCreator(
                              order.status,
                            ) && (

                              <div className="buyer-order-chat-box">

                                <div className="buyer-order-chat-info">

                                  <div className="buyer-order-chat-icon">
                                    💬
                                  </div>

                                  <div>

                                    <strong>
                                      Need help with this website?
                                    </strong>

                                    <span>
                                      Chat directly with the creator
                                      about your purchase.
                                    </span>

                                  </div>

                                </div>


                                <button
                                  type="button"
                                  className="buyer-chat-creator-button"
                                  onClick={() =>
                                    handleOpenChat(
                                      order.id,
                                      item.productId,
                                    )
                                  }
                                  disabled={
                                    openingChat ===
                                    `${order.id}-${item.productId}`
                                  }
                                >
                                  {openingChat ===
                                  `${order.id}-${item.productId}`
                                    ? 'Opening Chat...'
                                    : 'Chat with Creator'}

                                  <span>
                                    →
                                  </span>

                                </button>

                              </div>

                            )}

                          </div>

                        ),
                      )}

                    </div>


                    {/* =========================================
                        ORDER FOOTER
                    ========================================= */}

                    <div className="buyer-order-footer">

                      <div>

                        <span>
                          Order Total
                        </span>

                        <strong>
                          {formatCurrency(
                            order.totalAmount,
                          )}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Order Status
                        </span>

                        <strong>
                          {formatStatus(
                            order.status,
                          )}
                        </strong>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            )}

        </section>

      </section>

    </main>
  )
}