import { useEffect, useState } from 'react'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'

import './admin.css'


const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]


function AdminOrdersPage() {
  const { token } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const [selectedStatus, setSelectedStatus] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [deletingOrderId, setDeletingOrderId] = useState(null)
const [deleteError, setDeleteError] = useState('')


  useEffect(() => {
    async function loadOrders() {
      if (!token) {
        setIsLoading(false)
        setError('Authentication is required.')
        return
      }

      try {
        setError('')

        const data = await apiRequest(
          '/admin/orders',
          {
            method: 'GET',
            token,
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
            'Failed to load orders.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [token])


  function toggleOrder(orderId, orderStatus) {
    setExpandedOrderId((currentId) => {
      const nextId =
        currentId === orderId
          ? null
          : orderId

      if (nextId === orderId) {
        setSelectedStatus(orderStatus || 'PENDING')
        setStatusError('')
      }

      return nextId
    })
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


  function getCustomerName(order) {
    return (
      order.customer?.fullName ||
      'Unknown customer'
    )
  }


  async function handleStatusUpdate(orderId) {
    if (!selectedStatus) {
      return
    }

    setUpdatingOrderId(orderId)
    setStatusError('')

    try {
      const data = await apiRequest(
        `/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          token,
          body: {
            status: selectedStatus,
          },
        },
      )

      const updatedOrder = data?.order

      if (!updatedOrder) {
        throw new Error(
          'The server did not return the updated order.',
        )
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order,
        ),
      )

      setSelectedStatus(updatedOrder.status)
    } catch (requestError) {
      setStatusError(
        requestError?.message ||
          'Failed to update order status.',
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleDeleteOrder(orderId) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this order? This action cannot be undone.',
  )

  if (!confirmed) {
    return
  }

  setDeletingOrderId(orderId)
  setDeleteError('')

  try {
    await apiRequest(
      `/admin/orders/${orderId}`,
      {
        method: 'DELETE',
        token,
      },
    )

    setOrders((currentOrders) =>
      currentOrders.filter(
        (order) => order.id !== orderId,
      ),
    )

    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
    }

    setSelectedStatus('')
    setStatusError('')
  } catch (requestError) {
    setDeleteError(
      requestError?.message ||
        'Failed to delete order.',
    )
  } finally {
    setDeletingOrderId(null)
  }
}


  return (
    <div className="admin-layout">
      <AdminSidebar
          isOpen={sidebarOpen}
          onNavigate={() =>
            setSidebarOpen(false)
          }
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
            <div>
              <span className="admin-eyebrow">
                Marketplace
              </span>

              <h1>
                Orders
              </h1>

              <p>
                View and manage orders placed
                across your marketplace.
              </p>
            </div>
          </section>


          <section className="admin-orders-stats">
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <div>
                  <span className="admin-stat-label">
                    Total Orders
                  </span>

                  <strong className="admin-stat-value">
                    {orders.length}
                  </strong>
                </div>

                <span className="admin-stat-icon">
                  O
                </span>
              </div>
            </article>


            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <div>
                  <span className="admin-stat-label">
                    Pending Orders
                  </span>

                  <strong className="admin-stat-value">
                    {
                      orders.filter(
                        (order) =>
                          order.status === 'PENDING',
                      ).length
                    }
                  </strong>
                </div>

                <span className="admin-stat-icon">
                  P
                </span>
              </div>
            </article>


            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <div>
                  <span className="admin-stat-label">
                    Order Revenue
                  </span>

                  <strong className="admin-stat-value">
                    {formatCurrency(
                      orders.reduce(
                        (total, order) =>
                          total +
                          Number(
                            order.totalAmount || 0,
                          ),
                        0,
                      ),
                    )}
                  </strong>
                </div>

                <span className="admin-stat-icon">
                  ₹
                </span>
              </div>
            </article>
          </section>


          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span className="admin-panel-eyebrow">
                  Management
                </span>

                <h3>
                  All Orders
                </h3>
              </div>

              {deleteError && (
                <div className="admin-orders-error">
                  {deleteError}
                </div>
              )}

              <span className="admin-orders-count">
                {orders.length}{' '}
                {orders.length === 1
                  ? 'order'
                  : 'orders'}
              </span>
            </div>


            {isLoading && (
              <div className="admin-orders-message">
                Loading orders...
              </div>
            )}


            {!isLoading && error && (
              <div className="admin-orders-error">
                {error}
              </div>
            )}


            {!isLoading &&
              !error &&
              orders.length === 0 && (
                <div className="admin-orders-empty">
                  <strong>
                    No orders found
                  </strong>

                  <span>
                    Orders placed by customers
                    will appear here.
                  </span>
                </div>
              )}


            {!isLoading &&
              !error &&
              orders.length > 0 && (
                <div className="admin-table-wrapper">
                  <table className="admin-table admin-orders-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Details</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => {
                        const isExpanded =
                          expandedOrderId ===
                          order.id

                        const itemCount =
                          order.items.reduce(
                            (
                              total,
                              item,
                            ) =>
                              total +
                              Number(
                                item.quantity ||
                                  0,
                              ),
                            0,
                          )

                        return (
                          <tr
                            key={order.id}
                            className={
                              isExpanded
                                ? 'admin-order-row-expanded'
                                : ''
                            }
                          >
                            <td>
                              <strong>
                                #{order.id}
                              </strong>

                              <span>
                                {order.id}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {getCustomerName(
                                  order,
                                )}
                              </strong>

                              <span>
                                {
                                  order.customer
                                    ?.email
                                }
                              </span>
                            </td>

                            <td>
                              <strong>
                                {itemCount}
                              </strong>

                              <span>
                                {itemCount === 1
                                  ? 'item'
                                  : 'items'}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {formatCurrency(
                                  order.totalAmount,
                                )}
                              </strong>
                            </td>

                            <td>
                              <span
                                className={`status-badge ${
                                  String(
                                    order.status ||
                                      '',
                                  ).toLowerCase()
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {formatDate(
                                  order.createdAt,
                                )}
                              </strong>
                            </td>

                            <td>
                              <div className="admin-order-actions">
                                <button
                                  type="button"
                                  className="admin-order-details-button"
                                  onClick={() =>
                                    toggleOrder(
                                      order.id,
                                      order.status,
                                    )
                                  }
                                  aria-expanded={isExpanded}
                                >
                                  {isExpanded
                                    ? 'Hide'
                                    : 'View'}
                                </button>

                                <button
                                  type="button"
                                  className="admin-order-delete-button"
                                  onClick={() =>
                                    handleDeleteOrder(order.id)
                                  }
                                  disabled={
                                    deletingOrderId === order.id
                                  }
                                >
                                  {deletingOrderId === order.id
                                    ? 'Deleting...'
                                    : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>


                  {expandedOrderId && (
                    <div className="admin-order-expanded-list">
                      {orders
                        .filter(
                          (order) =>
                            order.id ===
                            expandedOrderId,
                        )
                        .map((order) => (
                          <div
                            key={order.id}
                            className="admin-order-expanded"
                          >
                            <div className="admin-order-expanded-header">
                              <div>
                                <span className="admin-panel-eyebrow">
                                  Order Details
                                </span>

                                <h3>
                                  #{order.id}
                                </h3>
                              </div>

                              <span
                                className={`status-badge ${
                                  String(
                                    order.status ||
                                      '',
                                  ).toLowerCase()
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>


                            <div className="admin-order-status-control">
                              <div>
                                <span>
                                  Order Status
                                </span>

                                <strong>
                                  Update the current
                                  order status.
                                </strong>
                              </div>

                              <div className="admin-order-status-actions">
                                <select
                                  value={
                                    selectedStatus
                                  }
                                  onChange={(event) => {
                                    setSelectedStatus(
                                      event.target.value,
                                    )

                                    setStatusError('')
                                  }}
                                  disabled={
                                    updatingOrderId ===
                                    order.id
                                  }
                                >
                                  {ORDER_STATUSES.map(
                                    (status) => (
                                      <option
                                        key={status}
                                        value={status}
                                      >
                                        {status}
                                      </option>
                                    ),
                                  )}
                                </select>

                                <button
                                  type="button"
                                  className="admin-primary-button"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      order.id,
                                    )
                                  }
                                  disabled={
                                    updatingOrderId ===
                                    order.id ||
                                    selectedStatus ===
                                      order.status
                                  }
                                >
                                  {updatingOrderId ===
                                  order.id
                                    ? 'Saving...'
                                    : 'Save Status'}
                                </button>
                              </div>
                            </div>


                            {statusError && (
                              <div className="admin-orders-error">
                                {statusError}
                              </div>
                            )}


                            <div className="admin-order-detail-grid">
                              <div>
                                <span>
                                  Customer
                                </span>

                                <strong>
                                  {
                                    order.customer
                                      ?.fullName
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Email
                                </span>

                                <strong>
                                  {
                                    order.customer
                                      ?.email
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Phone
                                </span>

                                <strong>
                                  {
                                    order.customer
                                      ?.phone
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Address
                                </span>

                                <strong>
                                  {[
                                    order.customer
                                      ?.address,
                                    order.customer
                                      ?.city,
                                    order.customer
                                      ?.state,
                                    order.customer
                                      ?.pincode,
                                  ]
                                    .filter(Boolean)
                                    .join(
                                      ', ',
                                    )}
                                </strong>
                              </div>
                            </div>


                            <div className="admin-order-items">
                              <div className="admin-order-items-heading">
                                <strong>
                                  Products
                                </strong>

                                <span>
                                  {order.items.length}{' '}
                                  {order.items.length ===
                                  1
                                    ? 'product'
                                    : 'products'}
                                </span>
                              </div>


                              {order.items.map(
                                (
                                  item,
                                ) => (
                                  <div
                                    key={`${order.id}-${item.productId}`}
                                    className="admin-order-item"
                                  >
                                    <div>
                                      <strong>
                                        {item.name}
                                      </strong>

                                      <span>
                                        {
                                          item.quantity
                                        } ×{' '}
                                        {formatCurrency(
                                          item.price,
                                        )}
                                      </span>
                                    </div>

                                    <strong>
                                      {formatCurrency(
                                        item.itemTotal,
                                      )}
                                    </strong>
                                  </div>
                                ),
                              )}


                              <div className="admin-order-total">
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
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
          </section>
        </main>
      </div>
    </div>
  )
}


export default AdminOrdersPage
export { AdminOrdersPage }