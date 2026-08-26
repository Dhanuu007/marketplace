import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './CreatorOrdersPage.css'


export function CreatorOrdersPage() {
  const auth = useAuth()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [earnings, setEarnings] = useState([])
  const [earningsLoading, setEarningsLoading] = useState(true)
  const [earningsError, setEarningsError] = useState('')

  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const [deliveryFile, setDeliveryFile] = useState(null)
  const [demoUrl, setDemoUrl] = useState('')
  const [instructions, setInstructions] = useState('')
  const [support, setSupport] = useState('')

  const [deliveryLoading, setDeliveryLoading] = useState(false)
  const [deliveryError, setDeliveryError] = useState('')


  // =========================================================
  // LOAD CREATOR ORDERS
  // =========================================================

  useEffect(() => {
    async function loadCreatorOrders() {
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
          '/creator/orders',
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
            'Unable to load your website orders.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadCreatorOrders()
  }, [auth.token])


  // =========================================================
  // LOAD CREATOR EARNINGS
  // =========================================================

  useEffect(() => {
    async function loadCreatorEarnings() {
      if (!auth.token) {
        setEarnings([])
        setEarningsLoading(false)
        setEarningsError(
          'Authentication is required.',
        )
        return
      }

      try {
        setEarningsLoading(true)
        setEarningsError('')

        const data = await apiRequest(
          '/creator/earnings',
          {
            method: 'GET',
            token: auth.token,
          },
        )

        setEarnings(
          Array.isArray(data?.earnings)
            ? data.earnings
            : [],
        )
      } catch (requestError) {
        setEarningsError(
          requestError?.message ||
            'Unable to load creator earnings.',
        )
      } finally {
        setEarningsLoading(false)
      }
    }

    loadCreatorEarnings()
  }, [auth.token])


  // =========================================================
  // HELPERS
  // =========================================================

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
    return `creator-order-status creator-order-status-${String(
      status || 'PENDING',
    ).toLowerCase()}`
  }


  function getDeliveryStatusClass(status) {
    return `creator-delivery-status creator-delivery-status-${String(
      status || 'NOT_DELIVERED',
    )
      .toLowerCase()
      .replace(/_/g, '-')}`
  }


  function getEarningForItem(
    orderId,
    productId,
  ) {
    return earnings.find(
      (earning) =>
        earning.orderId === orderId &&
        earning.productId === productId,
    )
  }


  function getOrderEarnings(orderId) {
    return earnings.filter(
      (earning) =>
        earning.orderId === orderId,
    )
  }


  // =========================================================
  // DELIVERY
  // =========================================================

  function openDeliveryForm(order, item) {
    setSelectedOrder(order)
    setSelectedItem(item)

    setDeliveryFile(null)
    setDemoUrl(item.delivery?.demoUrl || '')
    setInstructions(item.delivery?.instructions || '')
    setSupport(item.delivery?.support || '')

    setDeliveryError('')
    setDeliveryOpen(true)
  }


  function closeDeliveryForm() {
    if (deliveryLoading) {
      return
    }

    setDeliveryOpen(false)
    setSelectedOrder(null)
    setSelectedItem(null)

    setDeliveryFile(null)
    setDemoUrl('')
    setInstructions('')
    setSupport('')
    setDeliveryError('')
  }


  function handleDeliveryFileChange(event) {
    const file =
      event.target.files?.[0] || null

    if (!file) {
      setDeliveryFile(null)
      return
    }

    const fileName =
      file.name.toLowerCase()

    if (!fileName.endsWith('.zip')) {
      setDeliveryFile(null)

      setDeliveryError(
        'Only ZIP files are allowed.',
      )

      event.target.value = ''
      return
    }

    const maxFileSize =
      500 * 1024 * 1024

    if (file.size > maxFileSize) {
      setDeliveryFile(null)

      setDeliveryError(
        'The ZIP file must be 500 MB or smaller.',
      )

      event.target.value = ''
      return
    }

    setDeliveryError('')
    setDeliveryFile(file)
  }


  async function handleProvideDelivery(event) {
    event.preventDefault()

    if (!auth.token) {
      setDeliveryError(
        'Authentication is required.',
      )
      return
    }

    if (
      !selectedOrder ||
      !selectedItem
    ) {
      setDeliveryError(
        'Please select a website order item.',
      )
      return
    }

    if (!deliveryFile) {
      setDeliveryError(
        'Please select the website ZIP file.',
      )
      return
    }

    try {
      setDeliveryLoading(true)
      setDeliveryError('')

      const formData = new FormData()

      formData.append(
        'deliveryFile',
        deliveryFile,
      )

      formData.append(
        'demoUrl',
        demoUrl,
      )

      formData.append(
        'instructions',
        instructions,
      )

      formData.append(
        'support',
        support,
      )

      const data = await apiRequest(
        `/creator/orders/${selectedOrder.id}/items/${selectedItem.productId}/delivery`,
        {
          method: 'POST',
          token: auth.token,
          body: formData,
        },
      )

      if (data?.order) {
        const updatedOrder =
          data.order

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === updatedOrder.id
              ? {
                  ...order,
                  ...updatedOrder,
                }
              : order,
          ),
        )
      }

      closeDeliveryForm()
    } catch (requestError) {
      setDeliveryError(
        requestError?.message ||
          'Unable to provide website delivery.',
      )
    } finally {
      setDeliveryLoading(false)
    }
  }


  // =========================================================
  // ORDER STATISTICS
  // =========================================================

  const totalSales =
    earnings.reduce(
      (total, earning) =>
        total +
        Number(
          earning.creatorAmount || 0,
        ),
      0,
    )


  const totalGrossSales =
    earnings.reduce(
      (total, earning) =>
        total +
        Number(
          earning.grossAmount || 0,
        ),
      0,
    )


  const totalCommission =
    earnings.reduce(
      (total, earning) =>
        total +
        Number(
          earning.commissionAmount || 0,
        ),
      0,
    )


  const pendingDeliveryCount =
    orders.reduce(
      (total, order) =>
        total +
        (order.items ?? []).filter(
          (item) =>
            item.delivery?.status !==
            'DELIVERED',
        ).length,
      0,
    )


  const deliveredCount =
    orders.reduce(
      (total, order) =>
        total +
        (order.items ?? []).filter(
          (item) =>
            item.delivery?.status ===
            'DELIVERED',
        ).length,
      0,
    )


  return (
    <main className="creator-orders-shell">

      <section className="creator-orders-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="creator-orders-header">

          <div className="creator-orders-header-copy">

            <div className="creator-orders-eyebrow">

              <span className="creator-orders-eyebrow-dot" />

              Website Sales

            </div>


            <h1>
              Creator Orders
            </h1>


            <p className="creator-orders-welcome">
              Manage website purchases, prepare
              deliveries, and keep your buyers
              updated.
            </p>

          </div>


          <div className="creator-orders-header-actions">

            <Link
              to="/creator/dashboard"
              className="creator-orders-secondary-button"
            >
              <span>
                ←
              </span>

              Creator Dashboard
            </Link>

          </div>

        </header>


        {/* =================================================
            STATS
        ================================================= */}

        <section className="creator-orders-stats">

          <article className="creator-order-stat-card">

            <div className="creator-order-stat-top">

              <span>
                Website Orders
              </span>

              <div className="creator-order-stat-icon">
                #
              </div>

            </div>

            <strong>
              {orders.length}
            </strong>

            <small>
              Total marketplace orders
            </small>

          </article>


          <article className="creator-order-stat-card creator-order-stat-pending">

            <div className="creator-order-stat-top">

              <span>
                Pending Delivery
              </span>

              <div className="creator-order-stat-icon">
                ◷
              </div>

            </div>

            <strong>
              {pendingDeliveryCount}
            </strong>

            <small>
              Websites awaiting delivery
            </small>

          </article>


          <article className="creator-order-stat-card creator-order-stat-sales">

            <div className="creator-order-stat-top">

              <span>
                Your Earnings
              </span>

              <div className="creator-order-stat-icon">
                ₹
              </div>

            </div>

            <strong>
              {earningsLoading
                ? '—'
                : formatCurrency(
                    totalSales,
                  )}
            </strong>

            <small>
              After 5% marketplace fee
            </small>

          </article>


          <article className="creator-order-stat-card creator-order-stat-delivered">

            <div className="creator-order-stat-top">

              <span>
                Delivered
              </span>

              <div className="creator-order-stat-icon">
                ✓
              </div>

            </div>

            <strong>
              {deliveredCount}
            </strong>

            <small>
              Website deliveries completed
            </small>

          </article>

        </section>


        {/* =================================================
            EARNINGS SUMMARY
        ================================================= */}

        <section className="creator-earnings-summary">

          <div>

            <span>
              Gross Sales
            </span>

            <strong>
              {earningsLoading
                ? '—'
                : formatCurrency(
                    totalGrossSales,
                  )}
            </strong>

          </div>


          <div>

            <span>
              Marketplace Fee
            </span>

            <strong>
              {earningsLoading
                ? '—'
                : formatCurrency(
                    totalCommission,
                  )}
            </strong>

          </div>


          <div>

            <span>
              Your Earnings
            </span>

            <strong>
              {earningsLoading
                ? '—'
                : formatCurrency(
                    totalSales,
                  )}
            </strong>

          </div>

        </section>


        {earningsError &&
          !earningsLoading && (

            <div className="creator-orders-error">

              <div className="creator-orders-error-icon">
                !
              </div>

              <div>

                <strong>
                  Unable to load earnings
                </strong>

                <span>
                  {earningsError}
                </span>

              </div>

            </div>

          )}


        {/* =================================================
            ORDERS SECTION
        ================================================= */}

        <section className="creator-orders-section">

          <div className="creator-orders-section-heading">

            <div>

              <p className="eyebrow">
                Marketplace Purchases
              </p>

              <h2>
                Website Orders
              </h2>

              <p className="creator-orders-section-description">
                Review buyer information and provide
                the purchased website files.
              </p>

            </div>


            <span className="creator-orders-count">

              {orders.length}{' '}

              {orders.length === 1
                ? 'order'
                : 'orders'}

            </span>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="creator-orders-message">

              <div className="creator-orders-spinner" />

              <div>

                <strong>
                  Loading your orders
                </strong>

                <span>
                  Please wait while we fetch your
                  website purchases.
                </span>

              </div>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!loading &&
            error && (

              <div className="creator-orders-error">

                <div className="creator-orders-error-icon">
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


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            orders.length === 0 && (

              <div className="creator-orders-empty">

                <div className="creator-orders-empty-icon">
                  #
                </div>

                <p className="eyebrow">
                  Website Sales
                </p>

                <h3>
                  No website orders yet
                </h3>

                <p>
                  When a buyer purchases one of
                  your approved websites, the order
                  will appear here.
                </p>

                <Link
                  to="/creator/dashboard"
                  className="creator-primary-button"
                >
                  Back to Dashboard
                </Link>

              </div>

            )}


          {/* =================================================
              ORDERS
          ================================================= */}

          {!loading &&
            !error &&
            orders.length > 0 && (

              <div className="creator-orders-list">

                {orders.map((order) => {

                  const orderEarnings =
                    getOrderEarnings(
                      order.id,
                    )


                  const orderGrossAmount =
                    orderEarnings.reduce(
                      (
                        total,
                        earning,
                      ) =>
                        total +
                        Number(
                          earning.grossAmount ||
                            0,
                        ),
                      0,
                    )


                  const orderCommissionAmount =
                    orderEarnings.reduce(
                      (
                        total,
                        earning,
                      ) =>
                        total +
                        Number(
                          earning.commissionAmount ||
                            0,
                        ),
                      0,
                    )


                  const orderCreatorAmount =
                    orderEarnings.reduce(
                      (
                        total,
                        earning,
                      ) =>
                        total +
                        Number(
                          earning.creatorAmount ||
                            0,
                        ),
                      0,
                    )


                  return (
                    <article
                      key={order.id}
                      className="creator-order-card"
                    >

                      {/* =======================================
                          ORDER HEADER
                      ======================================= */}

                      <div className="creator-order-card-header">

                        <div>

                          <p className="creator-order-label">
                            Website Purchase
                          </p>

                          <h3>
                            Order #{order.id}
                          </h3>

                          <span className="creator-order-date">
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

                          <span className="creator-status-dot" />

                          {order.status ||
                            'PENDING'}

                        </span>

                      </div>


                      {/* =======================================
                          CUSTOMER
                      ======================================= */}

                      <div className="creator-order-customer">

                        <div className="creator-order-customer-heading">

                          <div>

                            <p className="creator-order-item-label">
                              Customer Information
                            </p>

                            <h4>
                              Buyer Details
                            </h4>

                          </div>

                        </div>


                        <div className="creator-order-customer-grid">

                          <div>

                            <span>
                              Name
                            </span>

                            <strong>
                              {order.customer?.fullName ||
                                order.customer?.name ||
                                '—'}
                            </strong>

                          </div>


                          <div>

                            <span>
                              Email
                            </span>

                            <strong>
                              {order.customer?.email ||
                                '—'}
                            </strong>

                          </div>


                          <div>

                            <span>
                              Phone
                            </span>

                            <strong>
                              {order.customer?.phone ||
                                '—'}
                            </strong>

                          </div>


                          <div>

                            <span>
                              Address
                            </span>

                            <strong>
                              {order.customer?.address ||
                                '—'}
                            </strong>

                          </div>

                        </div>

                      </div>


                      {/* =======================================
                          ORDER ITEMS
                      ======================================= */}

                      <div className="creator-order-items">

                        {(order.items ?? []).map(
                          (item) => {

                            const itemEarning =
                              getEarningForItem(
                                order.id,
                                item.productId,
                              )


                            return (
                              <div
                                key={`${order.id}-${item.productId}`}
                                className="creator-order-item"
                              >

                                <div className="creator-order-item-main">

                                  <div>

                                    <p className="creator-order-item-label">
                                      Purchased Website
                                    </p>

                                    <h4>
                                      {item.name}
                                    </h4>

                                  </div>


                                  <span
                                    className={getDeliveryStatusClass(
                                      item.delivery?.status ||
                                        'NOT_DELIVERED',
                                    )}
                                  >

                                    <span className="creator-status-dot" />

                                    {String(
                                      item.delivery?.status ||
                                        'NOT_DELIVERED',
                                    ).replace(
                                      /_/g,
                                      ' ',
                                    )}

                                  </span>

                                </div>


                                {/* =================================
                                    ITEM META
                                ================================= */}

                                <div className="creator-order-item-meta">

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
                                    CREATOR EARNINGS
                                ================================= */}

                                {itemEarning && (

                                  <div className="creator-item-earnings">

                                    <div>

                                      <span>
                                        Website Sale
                                      </span>

                                      <strong>
                                        {formatCurrency(
                                          itemEarning.grossAmount,
                                        )}
                                      </strong>

                                    </div>


                                    <div>

                                      <span>
                                        Marketplace Fee (5%)
                                      </span>

                                      <strong>
                                        -{formatCurrency(
                                          itemEarning.commissionAmount,
                                        )}
                                      </strong>

                                    </div>


                                    <div>

                                      <span>
                                        Your Earnings
                                      </span>

                                      <strong>
                                        {formatCurrency(
                                          itemEarning.creatorAmount,
                                        )}
                                      </strong>

                                    </div>

                                  </div>

                                )}


                                {/* =================================
                                    DELIVERY ACTION
                                ================================= */}

                                <div className="creator-order-item-action">

                                  {item.delivery?.status ===
                                  'DELIVERED' ? (

                                    <div className="creator-delivered-box">

                                      <span className="creator-delivered-check">
                                        ✓
                                      </span>

                                      <div>

                                        <strong>
                                          Delivery Provided
                                        </strong>

                                        <span>
                                          Buyer can download
                                          the website ZIP.
                                        </span>

                                      </div>

                                    </div>

                                  ) : (

                                    <button
                                      type="button"
                                      className="creator-delivery-button"
                                      onClick={() =>
                                        openDeliveryForm(
                                          order,
                                          item,
                                        )
                                      }
                                    >

                                      <span>
                                        ↑
                                      </span>

                                      Provide Delivery

                                    </button>

                                  )}

                                </div>

                              </div>
                            )
                          },
                        )}

                      </div>


                      {/* =======================================
                          ORDER FOOTER
                      ======================================= */}

                      <div className="creator-order-footer">

                        <div>

                          <span>
                            Website Sale
                          </span>

                          <strong>
                            {formatCurrency(
                              orderGrossAmount ||
                                order.totalAmount,
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Marketplace Fee (5%)
                          </span>

                          <strong>
                            {earningsLoading
                              ? 'Loading...'
                              : `-${formatCurrency(
                                  orderCommissionAmount,
                                )}`}
                          </strong>

                        </div>


                        <div className="creator-order-footer-earning">

                          <span>
                            Your Earnings
                          </span>

                          <strong>
                            {earningsLoading
                              ? 'Loading...'
                              : formatCurrency(
                                  orderCreatorAmount,
                                )}
                          </strong>

                        </div>

                      </div>

                    </article>
                  )
                })}

              </div>

            )}

        </section>

      </section>


      {/* =====================================================
          DELIVERY MODAL
      ===================================================== */}

      {deliveryOpen && (

        <div
          className="creator-delivery-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeDeliveryForm()
            }
          }}
        >

          <section
            className="creator-delivery-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="creator-delivery-title"
          >

            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <div className="creator-delivery-modal-header">

              <div>

                <p className="creator-order-label">
                  Website Delivery
                </p>

                <h2 id="creator-delivery-title">
                  Provide Delivery
                </h2>

                <p>
                  {selectedItem?.name ||
                    'Website'}
                </p>

              </div>


              <button
                type="button"
                className="creator-delivery-close"
                onClick={closeDeliveryForm}
                disabled={deliveryLoading}
                aria-label="Close delivery form"
              >
                ×
              </button>

            </div>


            {/* ===============================================
                FORM
            =============================================== */}

            <form
              className="creator-delivery-form"
              onSubmit={
                handleProvideDelivery
              }
            >

              {deliveryError && (

                <div className="creator-orders-error">

                  <div className="creator-orders-error-icon">
                    !
                  </div>

                  <div>

                    <strong>
                      Delivery could not be submitted
                    </strong>

                    <span>
                      {deliveryError}
                    </span>

                  </div>

                </div>

              )}


              <div className="creator-delivery-form-intro">

                <strong>
                  Complete website delivery
                </strong>

                <span>
                  Upload the website ZIP and provide
                  optional access information for the
                  buyer.
                </span>

              </div>


              <label className="creator-delivery-field">

                <span>
                  Website ZIP File <b>*</b>
                </span>

                <input
                  type="file"
                  accept=".zip,application/zip"
                  onChange={
                    handleDeliveryFileChange
                  }
                  disabled={
                    deliveryLoading
                  }
                />

                <small>
                  ZIP only. Maximum file size:
                  500 MB.
                </small>

                {deliveryFile && (

                  <strong className="creator-selected-file">
                    ✓ {deliveryFile.name}
                  </strong>

                )}

              </label>


              <label className="creator-delivery-field">

                <span>
                  Demo / Live URL
                </span>

                <input
                  type="url"
                  value={demoUrl}
                  onChange={(event) =>
                    setDemoUrl(
                      event.target.value,
                    )
                  }
                  placeholder="https://example.com"
                  disabled={
                    deliveryLoading
                  }
                />

                <small>
                  Optional link where the buyer can
                  view the live website.
                </small>

              </label>


              <label className="creator-delivery-field">

                <span>
                  Instructions
                </span>

                <textarea
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(
                      event.target.value,
                    )
                  }
                  placeholder="Explain how the buyer should use or set up the website."
                  rows={5}
                  disabled={
                    deliveryLoading
                  }
                />

              </label>


              <label className="creator-delivery-field">

                <span>
                  Support Information
                </span>

                <textarea
                  value={support}
                  onChange={(event) =>
                    setSupport(
                      event.target.value,
                    )
                  }
                  placeholder="Provide support contact information or support instructions."
                  rows={4}
                  disabled={
                    deliveryLoading
                  }
                />

              </label>


              <div className="creator-delivery-modal-actions">

                <button
                  type="button"
                  className="creator-delivery-cancel-button"
                  onClick={
                    closeDeliveryForm
                  }
                  disabled={
                    deliveryLoading
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="creator-delivery-submit-button"
                  disabled={
                    deliveryLoading
                  }
                >

                  {deliveryLoading ? (

                    <>
                      <span className="creator-submit-spinner" />

                      Providing Delivery...
                    </>

                  ) : (

                    <>
                      Provide Delivery

                      <span>
                        →
                      </span>
                    </>

                  )}

                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </main>
  )
}