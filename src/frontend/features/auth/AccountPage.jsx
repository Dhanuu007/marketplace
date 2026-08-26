import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from './useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { env } from '../../config/env.js'

import './auth.css'


const API_ORIGIN =
  env.apiBaseUrl.replace(/\/api\/?$/, '')


export function AccountPage() {
  const auth = useAuth()

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const [downloadingDelivery, setDownloadingDelivery] =
    useState('')


  useEffect(() => {
    async function loadOrders() {
      if (!auth.token) {
        setOrdersLoading(false)
        return
      }

      try {
        setOrdersError('')

        const data = await apiRequest('/orders', {
          method: 'GET',
          token: auth.token,
        })

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : [],
        )
      } catch (error) {
        setOrdersError(
          error?.message ||
            'Unable to load your orders.',
        )
      } finally {
        setOrdersLoading(false)
      }
    }

    loadOrders()
  }, [auth.token])


  function toggleOrder(orderId) {
    setExpandedOrderId((currentId) => (
      currentId === orderId
        ? null
        : orderId
    ))
  }


  function formatDate(value) {
    if (!value) {
      return '—'
    }

    return new Date(value).toLocaleString()
  }


  function formatCurrency(value) {
    return `₹${Number(
      value || 0,
    ).toLocaleString('en-IN')}`
  }


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
        `${API_ORIGIN}/api/orders/${encodeURIComponent(
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
    } catch (error) {
      window.alert(
        error?.message ||
          'Unable to download the website ZIP.',
      )
    } finally {
      setDownloadingDelivery('')
    }
  }


  function getDeliveryStatusClass(status) {
    return `order-delivery-status order-delivery-status-${String(
      status || 'NOT_DELIVERED',
    )
      .toLowerCase()
      .replaceAll('_', '-')}`
  }


  return (
    <main className="auth-shell">

      <section className="auth-card account-card">

        {/* =================================================
            ACCOUNT HEADER
        ================================================= */}

        <div className="account-header">

              <div className="account-header-actions">

                <Link
                  to="/buyer/dashboard"
                  className="account-back-button"
                >
                  ← Buyer Dashboard
                </Link>

              </div>


              <div className="account-header-copy">

                <p className="eyebrow">
                  Buyer Dashboard
                </p>

                <h1>
                  Welcome back, {auth.user.name}
                </h1>

            <p className="account-subtitle">
              Manage your account, purchased websites,
              and website deliveries from one place.
            </p>

          </div>


          <div className="account-header-badge">

            <span className="account-header-badge-dot" />

            Buyer Account

          </div>

        </div>


        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <dl className="account-details">

          <div>

            <dt>
              Name
            </dt>

            <dd>
              {auth.user.name}
            </dd>

          </div>


          <div>

            <dt>
              Email
            </dt>

            <dd>
              {auth.user.email}
            </dd>

          </div>


          <div>

            <dt>
              Role
            </dt>

            <dd>
              {auth.user.role}
            </dd>

          </div>

        </dl>


        {/* =================================================
            PURCHASE HISTORY
        ================================================= */}

        <section className="orders-section">

          <div className="orders-heading">

            <div>

              <p className="eyebrow">
                Purchase History
              </p>

              <h2>
                My Orders
              </h2>

            </div>


            <span className="orders-count">

              {orders.length}{' '}

              {orders.length === 1
                ? 'order'
                : 'orders'}

            </span>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {ordersLoading && (

            <p className="orders-message">
              Loading your orders...
            </p>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!ordersLoading &&
            ordersError && (

              <p className="form-error">
                {ordersError}
              </p>

            )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!ordersLoading &&
            !ordersError &&
            orders.length === 0 && (

              <div className="orders-empty">

                <h3>
                  No orders yet
                </h3>

                <p>
                  Your completed purchases will
                  appear here.
                </p>

                <Link to="/products">
                  Browse Products
                </Link>

              </div>

            )}


          {/* =================================================
              ORDERS
          ================================================= */}

          {!ordersLoading &&
            !ordersError &&
            orders.length > 0 && (

              <div className="orders-list">

                {orders.map((order) => {

                  const isExpanded =
                    expandedOrderId === order.id


                  return (

                    <article
                      key={order.id}
                      className="order-card"
                    >

                      {/* =====================================
                          ORDER SUMMARY
                      ===================================== */}

                      <button
                        type="button"
                        className="order-summary"
                        onClick={() =>
                          toggleOrder(order.id)
                        }
                        aria-expanded={isExpanded}
                      >

                        <div className="order-summary-product">

                          {order.items?.[0]?.image ? (

                            <img
                              src={
                                order.items[0].image
                              }
                              alt={
                                order.items[0].name ||
                                'Purchased website'
                              }
                              className="order-summary-image"
                            />

                          ) : (

                            <div className="order-summary-image order-summary-image-placeholder">
                              WEB
                            </div>

                          )}


                          <div className="order-summary-product-info">

                            <strong>
                              {order.items?.[0]?.name ||
                                'Purchased Website'}
                            </strong>

                            <span>
                              Order #{order.id}
                            </span>

                            <span>
                              {formatDate(
                                order.createdAt,
                              )}
                            </span>

                          </div>

                        </div>


                        <div className="order-summary-side">

                          <strong>
                            {formatCurrency(
                              order.totalAmount,
                            )}
                          </strong>


                          <span
                            className={`order-status order-status-${String(
                              order.status || '',
                            ).toLowerCase()}`}
                          >
                            {order.status}
                          </span>


                          <span className="order-summary-action">

                            {isExpanded
                              ? 'Hide Details ↑'
                              : 'View Details →'}

                          </span>

                        </div>

                      </button>


                      {/* =====================================
                          EXPANDED ORDER
                      ===================================== */}

                      {isExpanded && (

                        <div className="order-details">

                          {/* =================================
                              CUSTOMER INFORMATION
                          ================================= */}

                          <div className="order-customer">

                            <h3>
                              Customer Information
                            </h3>

                            <p>
                              <strong>
                                Name:
                              </strong>{' '}

                              {order.customer?.fullName ||
                                '—'}
                            </p>

                            <p>
                              <strong>
                                Email:
                              </strong>{' '}

                              {order.customer?.email ||
                                '—'}
                            </p>

                            <p>
                              <strong>
                                Phone:
                              </strong>{' '}

                              {order.customer?.phone ||
                                '—'}
                            </p>

                            <p>
                              <strong>
                                Address:
                              </strong>{' '}

                              {order.customer?.address ||
                                '—'}
                            </p>

                          </div>


                          {/* =================================
                              PURCHASED WEBSITES
                          ================================= */}

                          <div className="order-items">

                            <h3>
                              Purchased Websites
                            </h3>


                            {order.items.map(
                              (item) => {

                                const delivery =
                                  item.delivery || {}

                                const deliveryStatus =
                                  delivery.status ||
                                  'NOT_DELIVERED'

                                const downloadKey =
                                  `${order.id}-${item.productId}`

                                /*
                                 * Marketplace website ZIP.
                                 *
                                 * The ZIP is already stored
                                 * on the purchased order item.
                                 *
                                 * Creator delivery files are
                                 * still supported as a legacy
                                 * fallback.
                                 */
                                const websiteZip =
                                  typeof item.websiteZip === 'string' &&
                                  item.websiteZip.trim() !== ''
                                    ? item.websiteZip.trim()
                                    : ''

                                const legacyDeliveryFile =
                                  Array.isArray(
                                    delivery.files,
                                  ) &&
                                  delivery.files.length > 0
                                    ? delivery.files[0]
                                    : null

                                const hasDownloadableFile =
                                  Boolean(
                                    websiteZip ||
                                    legacyDeliveryFile?.fileName,
                                  )

                                const downloadFileName =
                                  legacyDeliveryFile?.originalName ||
                                  websiteZip ||
                                  'website-delivery.zip'


                                return (

                                  <div
                                    key={`${order.id}-${item.productId}`}
                                    className="order-item-wrapper"
                                  >

                                    {/* =======================
                                        WEBSITE
                                    ======================= */}

                                    <div className="order-item">

                                      <div className="order-item-info">

                                        {item.image && (

                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="order-item-image"
                                          />

                                        )}


                                        <div>

                                          <strong>
                                            {item.name}
                                          </strong>

                                          <span>
                                            {item.quantity}{' '}
                                            ×{' '}
                                            {formatCurrency(
                                              item.price,
                                            )}
                                          </span>

                                        </div>

                                      </div>


                                      <strong>
                                        {formatCurrency(
                                          item.itemTotal,
                                        )}
                                      </strong>

                                    </div>


                                    {/* =======================
                                        DELIVERY
                                    ======================= */}

                                    <div className="order-delivery">

                                      <div className="order-delivery-header">

                                        <div className="order-delivery-title">

                                          <div className="order-delivery-icon">
                                            ↓
                                          </div>


                                          <div>

                                            <p className="eyebrow">
                                              Website Delivery
                                            </p>

                                            <h4>
                                              Your website is ready
                                            </h4>

                                            <p className="order-delivery-subtitle">
                                              Access the files and resources
                                              provided by the website creator.
                                            </p>

                                          </div>

                                        </div>


                                        <span
                                          className={getDeliveryStatusClass(
                                            deliveryStatus,
                                          )}
                                        >
                                          {String(
                                            deliveryStatus,
                                          ).replaceAll(
                                            '_',
                                            ' ',
                                          )}
                                        </span>

                                      </div>


                                      {deliveryStatus ===
                                        'DELIVERED' ? (

                                        <div className="order-delivery-content">

                                          {/* =================
                                              ZIP FILE
                                          ================= */}

                                          {hasDownloadableFile && (

                                            <div className="delivery-download-card">

                                              <div className="delivery-file-icon">
                                                ZIP
                                              </div>


                                              <div className="delivery-file-info">

                                                <span>
                                                  Website Source Files
                                                </span>

                                                <strong>
                                                  {downloadFileName}
                                                </strong>

                                              </div>


                                              <button
                                                type="button"
                                                className="admin-primary-button delivery-download-button"
                                                onClick={() =>
                                                  handleDownloadDelivery(
                                                    order.id,
                                                    item.productId,
                                                    downloadFileName,
                                                  )
                                                }
                                                disabled={
                                                  downloadingDelivery ===
                                                  downloadKey
                                                }
                                              >
                                                {downloadingDelivery ===
                                                downloadKey
                                                  ? 'Downloading...'
                                                  : 'Download ZIP'}
                                              </button>

                                            </div>

                                          )}


                                          {/* =================
                                              LIVE WEBSITE
                                          ================= */}

                                          {delivery.demoUrl && (

                                            <div className="delivery-info-row">

                                              <div className="delivery-info-icon">
                                                ↗
                                              </div>


                                              <div className="delivery-info-copy">

                                                <span>
                                                  Demo / Live Website
                                                </span>

                                                <strong>
                                                  Preview the website online
                                                </strong>

                                              </div>


                                              <a
                                                href={
                                                  delivery.demoUrl
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="delivery-view-link"
                                              >
                                                View Website ↗
                                              </a>

                                            </div>

                                          )}


                                          {/* =================
                                              INSTRUCTIONS
                                          ================= */}

                                          {delivery.instructions && (

                                            <div className="delivery-text-card">

                                              <span>
                                                Instructions
                                              </span>

                                              <p>
                                                {
                                                  delivery.instructions
                                                }
                                              </p>

                                            </div>

                                          )}


                                          {/* =================
                                              SUPPORT
                                          ================= */}

                                          {delivery.support && (

                                            <div className="delivery-text-card">

                                              <span>
                                                Creator Support
                                              </span>

                                              <p>
                                                {
                                                  delivery.support
                                                }
                                              </p>

                                            </div>

                                          )}


                                          {/* =================
                                              DELIVERED DATE
                                          ================= */}

                                          {delivery.deliveredAt && (

                                            <div className="delivery-date">

                                              <span>
                                                Delivered
                                              </span>

                                              <strong>
                                                {formatDate(
                                                  delivery.deliveredAt,
                                                )}
                                              </strong>

                                            </div>

                                          )}

                                        </div>

                                      ) : (

                                        /* =====================
                                           PENDING DELIVERY
                                        ===================== */

                                        <div className="delivery-pending-card">

                                          <div className="delivery-pending-icon">
                                            !
                                          </div>


                                          <div>

                                            <strong>
                                              Website delivery is pending
                                            </strong>

                                            <p>
                                              The website creator has not
                                              delivered this website yet.
                                              Your download will become
                                              available once the delivery
                                              is completed.
                                            </p>

                                          </div>

                                        </div>

                                      )}

                                    </div>

                                  </div>

                                )
                              },
                            )}

                          </div>


                          {/* =================================
                              ORDER TOTAL
                          ================================= */}

                          <div className="order-total">

                            <span>
                              Total
                            </span>

                            <strong>
                              {formatCurrency(
                                order.totalAmount,
                              )}
                            </strong>

                          </div>

                        </div>

                      )}

                    </article>

                  )
                })}

              </div>

            )}

        </section>


        {/* =================================================
            ACCOUNT ACTIONS
        ================================================= */}

        <div className="auth-actions">

          <Link to="/admin-check">
            Admin check
          </Link>

          <button
            type="button"
            onClick={auth.logout}
          >
            Logout
          </button>

        </div>

      </section>

    </main>
  )
}