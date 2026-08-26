import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './CreatorFinancesPage.css'


export function CreatorFinancesPage() {
  const auth = useAuth()

  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =========================================================
  // LOAD CREATOR EARNINGS
  // =========================================================

  useEffect(() => {
    async function loadCreatorEarnings() {
      if (!auth.token) {
        setEarnings([])
        setLoading(false)
        setError('Authentication is required.')
        return
      }

      try {
        setLoading(true)
        setError('')

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
      } catch (error) {
        setError(
          error?.message ||
            'Unable to load your earnings.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadCreatorEarnings()
  }, [auth.token])


  // =========================================================
  // FINANCIAL STATISTICS
  // =========================================================

  const totalGrossSales = earnings.reduce(
    (total, earning) =>
      total + Number(earning.grossAmount || 0),
    0,
  )


  const totalMarketplaceFees = earnings.reduce(
    (total, earning) =>
      total + Number(earning.commissionAmount || 0),
    0,
  )


  const totalCreatorEarnings = earnings.reduce(
    (total, earning) =>
      total + Number(earning.creatorAmount || 0),
    0,
  )


  const pendingPayoutAmount = earnings
    .filter(
      (earning) =>
        String(earning.status || '').toUpperCase() ===
        'PENDING',
    )
    .reduce(
      (total, earning) =>
        total + Number(earning.creatorAmount || 0),
      0,
    )


  const paidPayoutAmount = earnings
    .filter(
      (earning) =>
        String(earning.status || '').toUpperCase() ===
        'PAID',
    )
    .reduce(
      (total, earning) =>
        total + Number(earning.creatorAmount || 0),
      0,
    )


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

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleDateString('en-IN')
  }


  function getPayoutStatusClass(status) {
    return `creator-payout-status creator-payout-status-${String(
      status || 'PENDING',
    ).toLowerCase()}`
  }


  function getEarningProductName(earning) {
    return (
      earning.productName ||
      earning.product?.name ||
      earning.websiteName ||
      earning.orderItem?.productName ||
      'Website Sale'
    )
  }


  return (
    <main className="creator-finances-page">

      <div className="creator-finances-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header className="creator-finances-header">

          <div>

            <p className="creator-finances-eyebrow">
              Creator Finances
            </p>

            <h1>
              Earnings & Payouts
            </h1>

            <p className="creator-finances-description">
              Track your website sales, marketplace
              commission, creator earnings, and payout
              status.
            </p>

          </div>


          <div className="creator-finances-header-actions">

            <Link
              to="/creator/payment-settings"
              className="creator-finances-settings-button"
            >
              Payment Settings
              <span>→</span>
            </Link>

            <Link
              to="/creator/dashboard"
              className="creator-finances-back-button"
            >
              ← Dashboard
            </Link>

          </div>

        </header>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && !loading && (

          <div className="creator-finances-error">

            <div className="creator-finances-error-icon">
              !
            </div>

            <div>

              <strong>
                Unable to load earnings
              </strong>

              <span>
                {error}
              </span>

            </div>

          </div>

        )}


        {/* =================================================
            FINANCIAL CARDS
        ================================================= */}

        <section className="creator-finances-stats">

          <article className="creator-finances-card creator-finances-gross">

            <div className="creator-finances-card-top">

              <span>
                Gross Sales
              </span>

              <div className="creator-finances-card-icon">
                ₹
              </div>

            </div>

            <strong>
              {loading
                ? '—'
                : formatCurrency(totalGrossSales)}
            </strong>

            <small>
              Total website sale value
            </small>

          </article>


          <article className="creator-finances-card creator-finances-fee">

            <div className="creator-finances-card-top">

              <span>
                Marketplace Fees
              </span>

              <div className="creator-finances-card-icon">
                5%
              </div>

            </div>

            <strong>
              {loading
                ? '—'
                : formatCurrency(totalMarketplaceFees)}
            </strong>

            <small>
              Marketplace commission
            </small>

          </article>


          <article className="creator-finances-card creator-finances-earned">

            <div className="creator-finances-card-top">

              <span>
                Your Earnings
              </span>

              <div className="creator-finances-card-icon">
                ₹
              </div>

            </div>

            <strong>
              {loading
                ? '—'
                : formatCurrency(totalCreatorEarnings)}
            </strong>

            <small>
              95% creator earnings
            </small>

          </article>


          <article className="creator-finances-card creator-finances-pending">

            <div className="creator-finances-card-top">

              <span>
                Pending Payout
              </span>

              <div className="creator-finances-card-icon">
                ◷
              </div>

            </div>

            <strong>
              {loading
                ? '—'
                : formatCurrency(pendingPayoutAmount)}
            </strong>

            <small>
              Awaiting payout
            </small>

          </article>

        </section>


        {/* =================================================
            PAYOUT BREAKDOWN
        ================================================= */}

        {!loading && !error && (

          <section className="creator-finances-breakdown">

            <div className="creator-finances-breakdown-item">

              <span>
                Creator Share
              </span>

              <strong>
                95%
              </strong>

              <small>
                Your earnings from every sale
              </small>

            </div>


            <div className="creator-finances-breakdown-divider" />


            <div className="creator-finances-breakdown-item">

              <span>
                Marketplace Commission
              </span>

              <strong>
                5%
              </strong>

              <small>
                Marketplace fee on every sale
              </small>

            </div>


            <div className="creator-finances-breakdown-divider" />


            <div className="creator-finances-breakdown-item">

              <span>
                Paid Out
              </span>

              <strong>
                {formatCurrency(paidPayoutAmount)}
              </strong>

              <small>
                Successfully paid to you
              </small>

            </div>

          </section>

        )}


        {/* =================================================
            FINANCIAL HISTORY
        ================================================= */}

        <section className="creator-finances-history">

          <div className="creator-finances-history-header">

            <div>

              <p className="creator-finances-eyebrow">
                Financial History
              </p>

              <h2>
                Earnings & Payout History
              </h2>

            </div>


            <span className="creator-finances-count">
              {earnings.length}{' '}
              {earnings.length === 1
                ? 'record'
                : 'records'}
            </span>

          </div>


          {loading && (

            <div className="creator-finances-loading">

              <div className="creator-finances-spinner" />

              <span>
                Loading your financial history...
              </span>

            </div>

          )}


          {!loading &&
            !error &&
            earnings.length > 0 && (

              <div className="creator-finances-table-wrapper">

                <table className="creator-finances-table">

                  <thead>

                    <tr>

                      <th>
                        Website
                      </th>

                      <th>
                        Sale
                      </th>

                      <th>
                        Marketplace Fee
                      </th>

                      <th>
                        Your Earnings
                      </th>

                      <th>
                        Payout Status
                      </th>

                      <th>
                        Date
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {earnings.map(
                      (earning, index) => (

                        <tr
                          key={
                            earning._id ||
                            earning.id ||
                            index
                          }
                        >

                          <td>

                            <strong>
                              {getEarningProductName(
                                earning,
                              )}
                            </strong>

                          </td>


                          <td>
                            {formatCurrency(
                              earning.grossAmount,
                            )}
                          </td>


                          <td>

                            <span className="creator-finances-fee-value">
                              -
                              {formatCurrency(
                                earning.commissionAmount,
                              )}
                            </span>

                          </td>


                          <td>

                            <strong className="creator-finances-earned-value">
                              {formatCurrency(
                                earning.creatorAmount,
                              )}
                            </strong>

                          </td>


                          <td>

                            <span
                              className={getPayoutStatusClass(
                                earning.status,
                              )}
                            >

                              <span className="creator-finances-status-dot" />

                              {earning.status ||
                                'PENDING'}

                            </span>

                          </td>


                          <td>
                            {formatDate(
                              earning.createdAt ||
                                earning.paidAt,
                            )}
                          </td>

                        </tr>

                      ),
                    )}

                  </tbody>

                </table>

              </div>

            )}


          {!loading &&
            !error &&
            earnings.length === 0 && (

              <div className="creator-finances-empty">

                <div className="creator-finances-empty-icon">
                  ₹
                </div>

                <p className="creator-finances-eyebrow">
                  No Sales Yet
                </p>

                <h3>
                  Your earnings will appear here
                </h3>

                <p>
                  Once a buyer purchases one of your
                  approved websites, your sale and creator
                  earnings will appear in this section.
                </p>

                <Link
                  to="/creator/listings/new"
                  className="creator-finances-add-button"
                >
                  Add Website Listing
                </Link>

              </div>

            )}

        </section>

      </div>

    </main>
  )
}