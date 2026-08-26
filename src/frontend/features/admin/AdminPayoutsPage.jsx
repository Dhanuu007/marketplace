import { useEffect, useState } from 'react'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'

import './admin.css'


function AdminPayoutsPage() {
  const { token } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [payouts, setPayouts] = useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] = useState('')

  const [expandedPayoutId, setExpandedPayoutId] =
    useState(null)

  const [updatingPayoutId, setUpdatingPayoutId] =
    useState(null)

  const [payoutError, setPayoutError] =
    useState('')


  useEffect(() => {
    async function loadPayouts() {
      if (!token) {
        setIsLoading(false)
        setError('Authentication is required.')
        return
      }


      try {
        setError('')

        const data = await apiRequest(
          '/admin/payouts',
          {
            method: 'GET',
            token,
          },
        )


        setPayouts(
          Array.isArray(data?.payouts)
            ? data.payouts
            : [],
        )
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Failed to load payouts.',
        )
      } finally {
        setIsLoading(false)
      }
    }


    loadPayouts()
  }, [token])


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


  function formatPercentage(value) {
    return `${(
      Number(value || 0) * 100
    ).toFixed(0)}%`
  }


  function togglePayout(payoutId) {
    setExpandedPayoutId((currentId) =>
      currentId === payoutId
        ? null
        : payoutId,
    )

    setPayoutError('')
  }


  async function handleMarkAsPaid(
    payoutId,
  ) {
    if (!token) {
      setPayoutError(
        'Authentication is required.',
      )

      return
    }


    setUpdatingPayoutId(payoutId)
    setPayoutError('')


    try {
      const data = await apiRequest(
        `/admin/payouts/${payoutId}/paid`,
        {
          method: 'PATCH',
          token,
        },
      )


      const updatedPayout =
        data?.payout


      if (!updatedPayout) {
        throw new Error(
          'The server did not return the updated payout.',
        )
      }


      setPayouts(
        (currentPayouts) =>
          currentPayouts.map(
            (payout) =>
              payout.id ===
              updatedPayout.id
                ? {
                    ...payout,
                    ...updatedPayout,
                  }
                : payout,
          ),
      )
    } catch (requestError) {
      setPayoutError(
        requestError?.message ||
          'Failed to mark payout as paid.',
      )
    } finally {
      setUpdatingPayoutId(null)
    }
  }


  const pendingPayouts =
    payouts.filter(
      (payout) =>
        payout.status === 'PENDING',
    )


  const paidPayouts =
    payouts.filter(
      (payout) =>
        payout.status === 'PAID',
    )


  const totalMarketplaceFee =
    payouts.reduce(
      (total, payout) =>
        total +
        Number(
          payout.commissionAmount || 0,
        ),
      0,
    )


  const totalCreatorAmount =
    payouts.reduce(
      (total, payout) =>
        total +
        Number(
          payout.creatorAmount || 0,
        ),
      0,
    )


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
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}


      <div className="admin-main">

        <AdminTopbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />


        <main className="admin-content">

          {/* =====================================================
              PAGE HEADER
          ===================================================== */}

          <section className="admin-page-header">

            <div>

              <span className="admin-eyebrow">
                Marketplace
              </span>

              <h1>
                Payouts
              </h1>

              <p>
                Review Creator earnings, marketplace
                fees, and payout information.
              </p>

            </div>

          </section>


          {/* =====================================================
              PAYOUT STATISTICS
          ===================================================== */}

          <section className="admin-orders-stats">

            <article className="admin-stat-card">

              <div className="admin-stat-top">

                <div>

                  <span className="admin-stat-label">
                    Pending Payouts
                  </span>

                  <strong className="admin-stat-value">
                    {pendingPayouts.length}
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
                    Paid Payouts
                  </span>

                  <strong className="admin-stat-value">
                    {paidPayouts.length}
                  </strong>

                </div>

                <span className="admin-stat-icon">
                  ✓
                </span>

              </div>

            </article>


            <article className="admin-stat-card">

              <div className="admin-stat-top">

                <div>

                  <span className="admin-stat-label">
                    Marketplace Fees
                  </span>

                  <strong className="admin-stat-value">
                    {formatCurrency(
                      totalMarketplaceFee,
                    )}
                  </strong>

                </div>

                <span className="admin-stat-icon">
                  5%
                </span>

              </div>

            </article>


            <article className="admin-stat-card">

              <div className="admin-stat-top">

                <div>

                  <span className="admin-stat-label">
                    Creator Earnings
                  </span>

                  <strong className="admin-stat-value">
                    {formatCurrency(
                      totalCreatorAmount,
                    )}
                  </strong>

                </div>

                <span className="admin-stat-icon">
                  ₹
                </span>

              </div>

            </article>

          </section>


          {/* =====================================================
              PAYOUT TABLE
          ===================================================== */}

          <section className="admin-panel">

            <div className="admin-panel-header">

              <div>

                <span className="admin-panel-eyebrow">
                  Creator Payments
                </span>

                <h3>
                  Payout Management
                </h3>

              </div>


              <span className="admin-orders-count">
                {payouts.length}{' '}
                {payouts.length === 1
                  ? 'payout'
                  : 'payouts'}
              </span>

            </div>


            {isLoading && (
              <div className="admin-orders-message">
                Loading payouts...
              </div>
            )}


            {!isLoading && error && (
              <div className="admin-orders-error">
                {error}
              </div>
            )}


            {!isLoading &&
              !error &&
              payouts.length === 0 && (
                <div className="admin-orders-empty">

                  <strong>
                    No payouts found
                  </strong>

                  <span>
                    Creator earnings will appear
                    here after successful payments.
                  </span>

                </div>
              )}


            {!isLoading &&
              !error &&
              payouts.length > 0 && (
                <div className="admin-table-wrapper">

                  <table className="admin-table">

                    <thead>

                      <tr>

                        <th>
                          Creator
                        </th>

                        <th>
                          Order
                        </th>

                        <th>
                          Website
                        </th>

                        <th>
                          Gross Sale
                        </th>

                        <th>
                          Fee
                        </th>

                        <th>
                          Creator Amount
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Details
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {payouts.map(
                        (payout) => {

                          const isExpanded =
                            expandedPayoutId ===
                            payout.id


                          return (
                            <tr
                              key={
                                payout.id
                              }
                              className={
                                isExpanded
                                  ? 'admin-order-row-expanded'
                                  : ''
                              }
                            >

                              <td>

                                <strong>
                                  {
                                    payout.creatorName ||
                                    'Unknown Creator'
                                  }
                                </strong>

                                <span>
                                  {
                                    payout.creatorId
                                  }
                                </span>

                              </td>


                              <td>

                                <strong>
                                  #
                                  {
                                    payout.orderId
                                  }
                                </strong>

                                <span>
                                  {
                                    payout.orderId
                                  }
                                </span>

                              </td>


                              <td>

                                <strong>
                                  {
                                    payout.productId
                                  }
                                </strong>

                                <span>
                                  Product ID
                                </span>

                              </td>


                              <td>

                                <strong>
                                  {formatCurrency(
                                    payout.grossAmount,
                                  )}
                                </strong>

                              </td>


                              <td>

                                <strong>
                                  {formatCurrency(
                                    payout.commissionAmount,
                                  )}
                                </strong>

                                <span>
                                  {formatPercentage(
                                    payout.commissionRate,
                                  )}{' '}
                                  fee
                                </span>

                              </td>


                              <td>

                                <strong>
                                  {formatCurrency(
                                    payout.creatorAmount,
                                  )}
                                </strong>

                                <span>
                                  95% Creator share
                                </span>

                              </td>


                              <td>

                                <span
                                  className={`status-badge ${
                                    String(
                                      payout.status ||
                                        '',
                                    ).toLowerCase()
                                  }`}
                                >
                                  {
                                    payout.status
                                  }
                                </span>

                              </td>


                              <td>

                                <button
                                  type="button"
                                  className="admin-order-details-button"
                                  onClick={() =>
                                    togglePayout(
                                      payout.id,
                                    )
                                  }
                                  aria-expanded={
                                    isExpanded
                                  }
                                >
                                  {isExpanded
                                    ? 'Hide'
                                    : 'View'}
                                </button>

                              </td>

                            </tr>
                          )
                        },
                      )}

                    </tbody>

                  </table>


                  {/* =================================================
                      EXPANDED PAYOUT DETAILS
                  ================================================= */}

                  {expandedPayoutId && (
                    <div className="admin-order-expanded-list">

                      {payouts
                        .filter(
                          (payout) =>
                            payout.id ===
                            expandedPayoutId,
                        )
                        .map(
                          (payout) => (
                            <div
                              key={
                                payout.id
                              }
                              className="admin-order-expanded"
                            >

                              <div className="admin-order-expanded-header">

                                <div>

                                  <span className="admin-panel-eyebrow">
                                    Payout Details
                                  </span>

                                  <h3>
                                    {
                                      payout.creatorName ||
                                      'Unknown Creator'
                                    }
                                  </h3>

                                </div>


                                <span
                                  className={`status-badge ${
                                    String(
                                      payout.status ||
                                        '',
                                    ).toLowerCase()
                                  }`}
                                >
                                  {
                                    payout.status
                                  }
                                </span>

                              </div>


                              {/* =================================================
                                  MARK AS PAID
                              ================================================= */}

                              {payout.status ===
                                'PENDING' && (
                                <div className="admin-order-status-control">

                                  <div>

                                    <span>
                                      Payout Status
                                    </span>

                                    <strong>
                                      Confirm the Creator
                                      payout after completing
                                      the payment.
                                    </strong>

                                  </div>


                                  <div className="admin-order-status-actions">

                                    <button
                                      type="button"
                                      className={
                                        payout.status === 'PAID'
                                          ? 'admin-primary-button payout-paid-button'
                                          : 'admin-primary-button'
                                      }
                                      onClick={() =>
                                        handleMarkAsPaid(
                                          payout.id,
                                        )
                                      }
                                      disabled={
                                        payout.status === 'PAID' ||
                                        updatingPayoutId ===
                                          payout.id
                                      }
                                    >
                                      {payout.status === 'PAID'
                                        ? '✓ Paid'
                                        : updatingPayoutId ===
                                            payout.id
                                          ? 'Processing...'
                                          : 'Mark as Paid'}
                                    </button>

                                  </div>

                                </div>
                              )}


                              {payoutError && (
                                <div className="admin-orders-error">
                                  {payoutError}
                                </div>
                              )}


                              {/* =================================================
                                  FINANCIAL DETAILS
                              ================================================= */}

                              <div className="admin-order-detail-grid">

                                <div>

                                  <span>
                                    Gross Sale
                                  </span>

                                  <strong>
                                    {formatCurrency(
                                      payout.grossAmount,
                                    )}
                                  </strong>

                                </div>


                                <div>

                                  <span>
                                    Marketplace Fee
                                  </span>

                                  <strong>
                                    {formatCurrency(
                                      payout.commissionAmount,
                                    )}{' '}
                                    (
                                    {formatPercentage(
                                      payout.commissionRate,
                                    )}
                                    )
                                  </strong>

                                </div>


                                <div>

                                  <span>
                                    Creator Amount
                                  </span>

                                  <strong>
                                    {formatCurrency(
                                      payout.creatorAmount,
                                    )}
                                  </strong>

                                </div>


                                <div>

                                  <span>
                                    Created
                                  </span>

                                  <strong>
                                    {formatDate(
                                      payout.createdAt,
                                    )}
                                  </strong>

                                </div>

                              </div>


                              {/* =================================================
                                  PAID INFORMATION
                              ================================================= */}

                              {payout.status ===
                                'PAID' && (
                                <div className="admin-order-items">

                                  <div className="admin-order-items-heading">

                                    <strong>
                                      Payout Completed
                                    </strong>

                                    <span>
                                      Historical
                                      payout record
                                    </span>

                                  </div>


                                  <div className="admin-order-item">

                                    <div>

                                      <strong>
                                        Paid At
                                      </strong>

                                    </div>

                                    <strong>
                                      {formatDate(
                                        payout.paidAt,
                                      )}
                                    </strong>

                                  </div>

                                </div>
                              )}


                              {/* =================================================
                                  ORDER / WEBSITE INFORMATION
                              ================================================= */}

                              <div className="admin-order-items">

                                <div className="admin-order-items-heading">

                                  <strong>
                                    Website / Order
                                  </strong>

                                  <span>
                                    Marketplace
                                    transaction
                                  </span>

                                </div>


                                <div className="admin-order-item">

                                  <div>

                                    <strong>
                                      Order
                                    </strong>

                                    <span>
                                      {
                                        payout.orderId
                                      }
                                    </span>

                                  </div>

                                  <strong>
                                    #
                                    {
                                      payout.orderId
                                    }
                                  </strong>

                                </div>


                                <div className="admin-order-item">

                                  <div>

                                    <strong>
                                      Website
                                    </strong>

                                    <span>
                                      Product ID
                                    </span>

                                  </div>

                                  <strong>
                                    {
                                      payout.productId
                                    }
                                  </strong>

                                </div>

                              </div>


                              {/* =================================================
                                  CREATOR PAYMENT INFORMATION
                              ================================================= */}

                              <div className="admin-order-items">

                                <div className="admin-order-items-heading">

                                  <strong>
                                    Creator Payment Details
                                  </strong>

                                  <span>
                                    Current payment
                                    profile
                                  </span>

                                </div>


                                {payout.paymentProfile ? (
                                  <>
                                    <div className="admin-order-item">

                                      <div>

                                        <strong>
                                          Account Holder
                                        </strong>

                                      </div>

                                      <strong>
                                        {
                                          payout
                                            .paymentProfile
                                            .accountHolderName ||
                                          '—'
                                        }
                                      </strong>

                                    </div>


                                    <div className="admin-order-item">

                                      <div>

                                        <strong>
                                          Bank
                                        </strong>

                                      </div>

                                      <strong>
                                        {
                                          payout
                                            .paymentProfile
                                            .bankName ||
                                          '—'
                                        }
                                      </strong>

                                    </div>


                                    <div className="admin-order-item">

                                      <div>

                                        <strong>
                                          Account Number
                                        </strong>

                                      </div>

                                      <strong>
                                        {
                                          payout
                                            .paymentProfile
                                            .accountNumber ||
                                          '—'
                                        }
                                      </strong>

                                    </div>


                                    <div className="admin-order-item">

                                      <div>

                                        <strong>
                                          IFSC
                                        </strong>

                                      </div>

                                      <strong>
                                        {
                                          payout
                                            .paymentProfile
                                            .ifscCode ||
                                          '—'
                                        }
                                      </strong>

                                    </div>


                                    <div className="admin-order-item">

                                      <div>

                                        <strong>
                                          UPI
                                        </strong>

                                      </div>

                                      <strong>
                                        {
                                          payout
                                            .paymentProfile
                                            .upiId ||
                                          '—'
                                        }
                                      </strong>

                                    </div>

                                  </>
                                ) : (
                                  <div className="admin-orders-empty">

                                    <strong>
                                      Payment details
                                      unavailable
                                    </strong>

                                    <span>
                                      This Creator has
                                      not configured
                                      payment details yet.
                                    </span>

                                  </div>
                                )}

                              </div>


                              {/* =================================================
                                  HISTORICAL PAYMENT SNAPSHOT
                              ================================================= */}

                              {payout.paymentDetails && (
                                <div className="admin-order-items">

                                  <div className="admin-order-items-heading">

                                    <strong>
                                      Paid Payment
                                      Snapshot
                                    </strong>

                                    <span>
                                      Historical
                                      payout details
                                    </span>

                                  </div>


                                  <div className="admin-order-item">

                                    <div>

                                      <strong>
                                        Account Holder
                                      </strong>

                                    </div>

                                    <strong>
                                      {
                                        payout
                                          .paymentDetails
                                          .accountHolderName ||
                                        '—'
                                      }
                                    </strong>

                                  </div>


                                  <div className="admin-order-item">

                                    <div>

                                      <strong>
                                        Bank
                                      </strong>

                                    </div>

                                    <strong>
                                      {
                                        payout
                                          .paymentDetails
                                          .bankName ||
                                        '—'
                                      }
                                    </strong>

                                  </div>


                                  <div className="admin-order-item">

                                    <div>

                                      <strong>
                                        Account Number
                                      </strong>

                                    </div>

                                    <strong>
                                      {
                                        payout
                                          .paymentDetails
                                          .accountNumber ||
                                        '—'
                                      }
                                    </strong>

                                  </div>


                                  <div className="admin-order-item">

                                    <div>

                                      <strong>
                                        IFSC
                                      </strong>

                                    </div>

                                    <strong>
                                      {
                                        payout
                                          .paymentDetails
                                          .ifscCode ||
                                        '—'
                                      }
                                    </strong>

                                  </div>


                                  <div className="admin-order-item">

                                    <div>

                                      <strong>
                                        UPI
                                      </strong>

                                    </div>

                                    <strong>
                                      {
                                        payout
                                          .paymentDetails
                                          .upiId ||
                                        '—'
                                      }
                                    </strong>

                                  </div>


                                  <div className="admin-order-item">

                                    <div>

                                      <strong>
                                        Paid At
                                      </strong>

                                    </div>

                                    <strong>
                                      {formatDate(
                                        payout.paidAt,
                                      )}
                                    </strong>

                                  </div>

                                </div>
                              )}

                            </div>
                          ),
                        )}

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


export default AdminPayoutsPage
export { AdminPayoutsPage }