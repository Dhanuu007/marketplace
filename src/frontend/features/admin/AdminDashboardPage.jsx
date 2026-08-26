import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminTopbar } from './components/AdminTopbar.jsx'
import { StatCard } from './components/StatCard.jsx'

import './admin.css'


function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [dashboardStats, setDashboardStats] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [chartMode, setChartMode] =
    useState('bar')

  const { token } = useAuth()
  const navigate = useNavigate()


  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    let isMounted = true

    async function loadDashboardStats() {
      if (!token) {
        if (isMounted) {
          setLoading(false)
          setError(
            'Authentication token is unavailable.',
          )
        }

        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          '/admin/dashboard',
          {
            token,
          },
        )

        if (isMounted) {
          setDashboardStats(
            data?.stats ?? null,
          )
        }
      } catch (requestError) {
        console.error(
          'Failed to load admin dashboard:',
          requestError,
        )

        if (isMounted) {
          setError(
            requestError?.message ||
              'Failed to load dashboard data.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboardStats()

    return () => {
      isMounted = false
    }
  }, [token])


  // =========================================================
  // MARKETPLACE ACTIVITY
  // =========================================================

  const activity =
    dashboardStats?.activity ?? null

  const activityBuckets =
    activity?.buckets ?? []

  const activityGrowth =
    Number(
      activity?.growthPercentage ?? 0,
    )


  // =========================================================
  // RECENT ACTIVITY
  // =========================================================

  const recentActivity =
    dashboardStats?.recentActivity ?? []


  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const stats = [
    {
      label: 'Total Sellers',

      value: loading
        ? '...'
        : String(
            dashboardStats?.sellers ?? 0,
          ),

      description:
        'Registered creators',

      trend: '',

      icon: 'S',
    },

    {
      label: 'Total Buyers',

      value: loading
        ? '...'
        : String(
            dashboardStats?.buyers ?? 0,
          ),

      description:
        'Registered buyers',

      trend: '',

      icon: 'B',
    },

    {
      label: 'Total Orders',

      value: loading
        ? '...'
        : String(
            dashboardStats?.orders ?? 0,
          ),

      description:
        'All marketplace orders',

      trend: '',

      icon: 'O',
    },

    {
      label: 'Revenue',

      value: loading
        ? '...'
        : `₹${Number(
            dashboardStats?.revenue ?? 0,
          ).toLocaleString('en-IN')}`,

      description:
        'Paid orders',

      trend: '',

      icon: '₹',
    },
  ]


  // =========================================================
  // FORMAT RECENT ACTIVITY TIME
  // =========================================================

  function formatActivityTime(value) {
    if (!value) {
      return '—'
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—'
    }

    const now =
      new Date()

    const difference =
      Math.max(
        0,
        now.getTime() -
          date.getTime(),
      )

    const minutes = Math.floor(
      difference /
        (1000 * 60),
    )

    if (minutes < 1) {
      return 'now'
    }

    if (minutes < 60) {
      return `${minutes}m`
    }

    const hours = Math.floor(
      minutes / 60,
    )

    if (hours < 24) {
      return `${hours}h`
    }

    const days = Math.floor(
      hours / 24,
    )

    if (days < 7) {
      return `${days}d`
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
      },
    )
  }


  // =========================================================
  // WAVE CHART DATA
  // =========================================================

  function getWaveChartPoints() {
    if (!activityBuckets.length) {
      return []
    }

    const width = 1000
    const height = 250

    return activityBuckets.map(
      (bucket, index) => {
        const x =
          activityBuckets.length === 1
            ? width / 2
            : (
                index /
                (activityBuckets.length - 1)
              ) * width

        const percentage =
          Math.min(
            100,
            Math.max(
              0,
              Number(
                bucket.percentage ?? 0,
              ),
            ),
          )

        const y =
          height -
          (percentage / 100) *
            height

        return {
          x,
          y,
          bucket,
        }
      },
    )
  }


  // =========================================================
  // SMOOTH WAVE PATH
  // =========================================================

  function getSmoothWavePath(points) {
    if (!points.length) {
      return ''
    }

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`
    }

    let path =
      `M ${points[0].x} ${points[0].y}`

    for (
      let index = 0;
      index < points.length - 1;
      index += 1
    ) {
      const current =
        points[index]

      const next =
        points[index + 1]

      const previous =
        points[index - 1] ||
        current

      const afterNext =
        points[index + 2] ||
        next

      const controlPointOne = {
        x:
          current.x +
          (next.x - previous.x) /
            6,

        y:
          current.y +
          (next.y - previous.y) /
            6,
      }

      const controlPointTwo = {
        x:
          next.x -
          (afterNext.x - current.x) /
            6,

        y:
          next.y -
          (afterNext.y - current.y) /
            6,
      }

      path +=
        ` C ` +
        `${controlPointOne.x} ${controlPointOne.y}, ` +
        `${controlPointTwo.x} ${controlPointTwo.y}, ` +
        `${next.x} ${next.y}`
    }

    return path
  }


  // =========================================================
  // SMOOTH WAVE AREA PATH
  // =========================================================

  function getSmoothWaveAreaPath(points) {
    if (!points.length) {
      return ''
    }

    const bottom = 280

    const linePath =
      getSmoothWavePath(points)

    const firstPoint =
      points[0]

    const lastPoint =
      points[points.length - 1]

    return (
      `${linePath} ` +
      `L ${lastPoint.x} ${bottom} ` +
      `L ${firstPoint.x} ${bottom} ` +
      'Z'
    )
  }


  // =========================================================
  // WAVE POINTS
  // =========================================================

  const wavePoints =
    getWaveChartPoints()

  const wavePath =
    getSmoothWavePath(
      wavePoints,
    )

  const waveAreaPath =
    getSmoothWaveAreaPath(
      wavePoints,
    )


  return (
    <div className="admin-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="admin-main">

        <AdminTopbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />


        <main className="admin-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="admin-page-header">

            <div className="admin-page-header-copy">

              <span className="admin-eyebrow">
                Marketplace
              </span>

              <h1>
                Dashboard
              </h1>

              <p>
                Welcome back. Here&apos;s what&apos;s
                happening with your marketplace today.
              </p>

            </div>


            <div className="admin-header-actions">

              <button
                className="admin-primary-button"
                type="button"
                onClick={() =>
                  navigate('/admin/orders')
                }
              >
                View Orders
              </button>


              <button
                className="admin-secondary-button"
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/website-management',
                  )
                }
              >
                Website Management
              </button>

            </div>

          </section>


          {/* =================================================
              DASHBOARD ERROR
          ================================================= */}

          {error && (
            <div
              role="alert"
              className="admin-dashboard-error"
            >
              {error}
            </div>
          )}


          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="admin-stats-grid">

            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                description={
                  stat.description
                }
                trend={stat.trend}
                icon={stat.icon}
              />
            ))}

          </section>


          {/* =================================================
              DASHBOARD OVERVIEW
          ================================================= */}

          <section className="admin-dashboard-grid">

            {/* =================================================
                MARKETPLACE ACTIVITY
            ================================================= */}

            <article className="admin-panel admin-overview-panel">

              <div className="admin-panel-header">

                <div>

                  <span className="admin-panel-eyebrow">
                    Overview
                  </span>

                  <h2>
                    Marketplace Activity
                  </h2>

                </div>


                {/* =================================================
                    CHART SWITCH
                ================================================= */}

                <div
                  className="admin-chart-controls"
                  role="group"
                  aria-label="Chart type"
                >

                  <button
                    type="button"
                    className={
                      chartMode === 'bar'
                        ? 'admin-chart-toggle active'
                        : 'admin-chart-toggle'
                    }
                    onClick={() =>
                      setChartMode('bar')
                    }
                    aria-pressed={
                      chartMode === 'bar'
                    }
                  >
                    Bar
                  </button>


                  <button
                    type="button"
                    className={
                      chartMode === 'wave'
                        ? 'admin-chart-toggle active'
                        : 'admin-chart-toggle'
                    }
                    onClick={() =>
                      setChartMode('wave')
                    }
                    aria-pressed={
                      chartMode === 'wave'
                    }
                  >
                    Wave
                  </button>

                </div>

              </div>


              <div className="admin-chart-area">

                <div className="admin-chart-summary">

                  <div>

                    <span>
                      Activity
                    </span>

                    <strong>
                      {loading
                        ? '...'
                        : `+${activityGrowth.toFixed(
                            1,
                          )}%`}
                    </strong>

                  </div>


                  <small>
                    Last 30 days
                  </small>

                </div>


                {/* =================================================
                    BAR CHART
                ================================================= */}

                {chartMode === 'bar' && (

                  <div className="admin-chart">

                    <div className="admin-chart-grid">

                      <span />
                      <span />
                      <span />
                      <span />

                    </div>


                    <div className="admin-chart-bars">

                      {activityBuckets.map(
                        (bucket) => (

                          <div
                            className="admin-chart-column"
                            key={bucket.label}
                            title={`${bucket.label}: ₹${Number(
                              bucket.value ?? 0,
                            ).toLocaleString(
                              'en-IN',
                            )}`}
                          >

                            <span
                              style={{
                                height: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(
                                      bucket.percentage ??
                                        0,
                                    ),
                                  ),
                                )}%`,
                              }}
                            />

                          </div>

                        ),
                      )}

                    </div>


                    <div className="admin-chart-labels">

                      {activityBuckets.map(
                        (bucket) => (

                          <span
                            key={bucket.label}
                          >
                            {bucket.label}
                          </span>

                        ),
                      )}

                    </div>

                  </div>

                )}


                {/* =================================================
                    SMOOTH WAVE CHART
                ================================================= */}

                {chartMode === 'wave' && (

                  <div className="admin-chart admin-wave-chart-container">

                    <div className="admin-chart-grid">

                      <span />
                      <span />
                      <span />
                      <span />

                    </div>


                    <div className="admin-wave-chart">

                      {activityBuckets.length > 0 ? (

                        <svg
                          className="admin-wave-svg"
                          viewBox="0 0 1000 300"
                          preserveAspectRatio="none"
                          role="img"
                          aria-label="Marketplace activity wave chart"
                        >

                          <defs>

                            <linearGradient
                              id="adminWaveFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >

                              <stop
                                offset="0%"
                                stopColor="#008f8f"
                                stopOpacity="0.22"
                              />

                              <stop
                                offset="55%"
                                stopColor="#008f8f"
                                stopOpacity="0.08"
                              />

                              <stop
                                offset="100%"
                                stopColor="#008f8f"
                                stopOpacity="0"
                              />

                            </linearGradient>

                          </defs>


                          {/* Smooth filled area */}

                          <path
                            className="admin-wave-area"
                            d={waveAreaPath}
                            fill="url(#adminWaveFill)"
                          />


                          {/* Smooth teal curve */}

                          <path
                            className="admin-wave-line"
                            d={wavePath}
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                          />


                          {/* Data points */}

                          {wavePoints.map(
                            ({
                              x,
                              y,
                              bucket,
                            }) => (

                              <g
                                key={
                                  bucket.label
                                }
                              >

                                <circle
                                  className="admin-wave-point-halo"
                                  cx={x}
                                  cy={y}
                                  r="8"
                                />


                                <circle
                                  className="admin-wave-point"
                                  cx={x}
                                  cy={y}
                                  r="4"
                                >

                                  <title>
                                    {`${bucket.label}: ₹${Number(
                                      bucket.value ?? 0,
                                    ).toLocaleString(
                                      'en-IN',
                                    )}`}
                                  </title>

                                </circle>

                              </g>

                            ),
                          )}

                        </svg>

                      ) : (

                        <div className="admin-chart-empty">
                          No activity data available.
                        </div>

                      )}

                    </div>


                    <div className="admin-chart-labels">

                      {activityBuckets.map(
                        (bucket) => (

                          <span
                            key={bucket.label}
                          >
                            {bucket.label}
                          </span>

                        ),
                      )}

                    </div>

                  </div>

                )}

              </div>

            </article>


            {/* =================================================
    RECENT ACTIVITY
================================================= */}

<article className="admin-panel admin-recent-activity-panel">

  <div className="admin-panel-header">

    <div>

      <span className="admin-panel-eyebrow">
        Activity
      </span>

      <h2>
        Recent Activity
      </h2>

    </div>


    <button
      className="admin-panel-action admin-activity-view-button"
      type="button"
      onClick={() =>
        navigate('/admin/activity')
      }
    >
      Latest activity
      <span aria-hidden="true">
        →
      </span>
    </button>

  </div>


  <div className="admin-activity-list">

    {/* =================================================
        LOADING
    ================================================= */}

    {loading && (

      <div className="admin-activity-state">

        <div className="admin-activity-loading-icon">
          <span />
        </div>

        <div className="admin-activity-content">

          <strong>
            Loading activity
          </strong>

          <p>
            Fetching the latest marketplace events.
          </p>

        </div>

      </div>

    )}


    {/* =================================================
        EMPTY
    ================================================= */}

    {!loading &&
      recentActivity.length === 0 && (

        <div className="admin-activity-state">

          <div className="admin-activity-empty-icon">
            —
          </div>

          <div className="admin-activity-content">

            <strong>
              No recent activity
            </strong>

            <p>
              Marketplace activity will appear here.
            </p>

          </div>

        </div>

      )}


    {/* =================================================
        ACTIVITY ITEMS
    ================================================= */}

    {!loading &&
      recentActivity.length > 0 &&

      recentActivity.map(
        (item, index) => {

          const activityType =
            String(
              item.type ?? '',
            ).toLowerCase()

          return (

            <div
              className={`admin-activity-item admin-activity-type-${activityType}`}
              key={
                item.id ||
                `${item.type}-${item.createdAt}-${index}`
              }
            >

              <div className="admin-activity-icon">

                {item.icon ||
                  item.type?.charAt(0) ||
                  '•'}

              </div>


              <div className="admin-activity-content">

                <strong>
                  {item.title ||
                    'Marketplace activity'}
                </strong>

                <p>
                  {item.description ||
                    'A marketplace event occurred.'}
                </p>

              </div>


              <time
                className="admin-activity-time"
                dateTime={
                  item.createdAt ||
                  undefined
                }
              >
                {formatActivityTime(
                  item.createdAt,
                )}
              </time>

            </div>

          )
        },
      )}

  </div>

</article>

          </section>


          {/* =================================================
    QUICK ACTIONS
================================================= */}

<section className="admin-panel admin-quick-actions">

  <div className="admin-panel-header">

    <div>

      <span className="admin-panel-eyebrow">
        Management
      </span>

      <h2>
        Quick Actions
      </h2>

    </div>

    <span className="admin-quick-actions-count">
      4 actions
    </span>

  </div>


  <div className="admin-quick-actions-grid">

    {/* =================================================
        MANAGE ORDERS
    ================================================= */}

    <button
      type="button"
      onClick={() =>
        navigate('/admin/orders')
      }
    >

      <span className="admin-quick-action-icon">
        O
      </span>


      <span className="admin-quick-action-content">

        <strong>
          Manage Orders
        </strong>

        <small>
          Review marketplace orders
        </small>

      </span>


      <span
        className="admin-quick-action-arrow"
        aria-hidden="true"
      >
        →
      </span>

    </button>


    {/* =================================================
        MANAGE PRODUCTS
    ================================================= */}

    <button
      type="button"
      onClick={() =>
        navigate('/admin/products')
      }
    >

      <span className="admin-quick-action-icon">
        P
      </span>


      <span className="admin-quick-action-content">

        <strong>
          Manage Products
        </strong>

        <small>
          Review marketplace websites
        </small>

      </span>


      <span
        className="admin-quick-action-arrow"
        aria-hidden="true"
      >
        →
      </span>

    </button>


    {/* =================================================
        WEBSITE MANAGEMENT
    ================================================= */}

    <button
      type="button"
      onClick={() =>
        navigate(
          '/admin/website-management',
        )
      }
    >

      <span className="admin-quick-action-icon">
        W
      </span>


      <span className="admin-quick-action-content">

        <strong>
          Website Management
        </strong>

        <small>
          Manage marketplace content
        </small>

      </span>


      <span
        className="admin-quick-action-arrow"
        aria-hidden="true"
      >
        →
      </span>

    </button>


    {/* =================================================
        MANAGE PAYOUTS
    ================================================= */}

    <button
      type="button"
      onClick={() =>
        navigate('/admin/payouts')
      }
    >

      <span className="admin-quick-action-icon">
        ₹
      </span>


      <span className="admin-quick-action-content">

        <strong>
          Manage Payouts
        </strong>

        <small>
          Review creator payouts
        </small>

      </span>


      <span
        className="admin-quick-action-arrow"
        aria-hidden="true"
      >
        →
      </span>

    </button>

  </div>

</section>

        </main>

      </div>

    </div>
  )
}


export default AdminDashboardPage

export {
  AdminDashboardPage,
}