import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'

const USERS_COLLECTION = 'users'
const ORDERS_COLLECTION = 'orders'

export async function getAdminDashboardStats() {
  const database = getDatabase()

  const usersCollection =
    database.collection(USERS_COLLECTION)

  const ordersCollection =
    database.collection(ORDERS_COLLECTION)

  const now = new Date()

  const currentPeriodStart =
    new Date(now)

  currentPeriodStart.setDate(
    currentPeriodStart.getDate() - 30,
  )

  const previousPeriodStart =
    new Date(currentPeriodStart)

  previousPeriodStart.setDate(
    previousPeriodStart.getDate() - 30,
  )


  const [
    sellers,
    buyers,
    orders,
    revenueResult,
    currentActivityResult,
    previousActivityResult,
    recentCreators,
    recentBuyers,
    recentOrders,
    recentPayments,
  ] = await Promise.all([
    // =========================================================
    // TOTAL CREATORS
    // =========================================================

    usersCollection.countDocuments({
      role: 'CREATOR',
    }),


    // =========================================================
    // TOTAL BUYERS
    // =========================================================

    usersCollection.countDocuments({
      role: 'BUYER',
    }),


    // =========================================================
    // TOTAL ORDERS
    // =========================================================

    ordersCollection.countDocuments(),


    // =========================================================
    // TOTAL REVENUE
    // =========================================================

    ordersCollection
      .aggregate([
        {
          $match: {
            status: 'PAID',
          },
        },

        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: {
                $toDouble: '$totalAmount',
              },
            },
          },
        },
      ])
      .toArray(),


    // =========================================================
    // CURRENT 30-DAY ACTIVITY
    // =========================================================

    ordersCollection
      .aggregate([
        {
          $match: {
            status: 'PAID',

            createdAt: {
              $gte: currentPeriodStart,
              $lt: now,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: 'Asia/Kolkata',
              },
            },

            revenue: {
              $sum: {
                $toDouble: '$totalAmount',
              },
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .toArray(),


    // =========================================================
    // PREVIOUS 30-DAY ACTIVITY
    // =========================================================

    ordersCollection
      .aggregate([
        {
          $match: {
            status: 'PAID',

            createdAt: {
              $gte: previousPeriodStart,
              $lt: currentPeriodStart,
            },
          },
        },

        {
          $group: {
            _id: null,

            revenue: {
              $sum: {
                $toDouble: '$totalAmount',
              },
            },
          },
        },
      ])
      .toArray(),


    // =========================================================
    // RECENT CREATOR REGISTRATIONS
    // =========================================================

    usersCollection
      .find({
        role: 'CREATOR',
      })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .toArray(),


    // =========================================================
    // RECENT BUYER REGISTRATIONS
    // =========================================================

    usersCollection
      .find({
        role: 'BUYER',
      })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .toArray(),


    // =========================================================
    // RECENT ORDERS
    // =========================================================

    ordersCollection
      .find({})
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .toArray(),


    // =========================================================
    // RECENT PAYMENTS
    //
    // Payment verification changes the order status
    // to PAID and updates updatedAt.
    //
    // We use updatedAt as the available payment-time
    // signal because the current payment flow does not
    // store a separate paidAt field.
    // =========================================================

    ordersCollection
      .find({
        status: 'PAID',
      })
      .sort({
        updatedAt: -1,
      })
      .limit(10)
      .toArray(),
  ])


  // =========================================================
  // REVENUE
  // =========================================================

  const revenue =
    revenueResult[0]?.totalRevenue ?? 0


  // =========================================================
  // CURRENT PERIOD REVENUE
  // =========================================================

  const currentPeriodRevenue =
    currentActivityResult.reduce(
      (total, item) =>
        total +
        Number(item.revenue || 0),
      0,
    )


  // =========================================================
  // PREVIOUS PERIOD REVENUE
  // =========================================================

  const previousPeriodRevenue =
    previousActivityResult[0]?.revenue ?? 0


  // =========================================================
  // GROWTH
  // =========================================================

  let growthPercentage = 0


  if (previousPeriodRevenue > 0) {
    growthPercentage =
      (
        (
          currentPeriodRevenue -
          previousPeriodRevenue
        ) /
        previousPeriodRevenue
      ) *
      100
  } else if (currentPeriodRevenue > 0) {
    growthPercentage = 100
  }


  // =========================================================
  // ACTIVITY BUCKETS
  // =========================================================

  const activityBuckets =
    createActivityBuckets(
      currentPeriodStart,
      now,
      currentActivityResult,
    )


  const maximumActivity =
    Math.max(
      ...activityBuckets.map(
        (bucket) => bucket.value,
      ),
      0,
    )


  const activity =
    activityBuckets.map((bucket) => ({
      ...bucket,

      percentage:
        maximumActivity > 0
          ? Math.round(
              (
                bucket.value /
                maximumActivity
              ) *
                100,
            )
          : 0,
    }))


  // =========================================================
  // RECENT ACTIVITY
  // =========================================================

  const recentActivity =
    buildRecentActivity({
      recentCreators,
      recentBuyers,
      recentOrders,
      recentPayments,
    })


  // =========================================================
  // RESPONSE
  // =========================================================

  return {
    sellers,
    buyers,
    orders,
    revenue,

    activity: {
      period: 'LAST_30_DAYS',

      currentPeriodRevenue,

      previousPeriodRevenue,

      growthPercentage:
        Number(
          growthPercentage.toFixed(1),
        ),

      buckets: activity,
    },

    recentActivity,
  }
}


// =============================================================
// BUILD RECENT ACTIVITY
// =============================================================

function buildRecentActivity({
  recentCreators,
  recentBuyers,
  recentOrders,
  recentPayments,
}) {
  const activity = []


  // ===========================================================
  // CREATOR REGISTRATIONS
  // ===========================================================

  for (const creator of recentCreators) {
    activity.push({
      id:
        `creator-${creator._id.toString()}`,

      type: 'CREATOR',

      icon: 'S',

      title:
        'New creator registered',

      description:
        creator.name
          ? `${creator.name} joined the marketplace`
          : 'A new creator joined the marketplace',

      createdAt:
        creator.createdAt,
    })
  }


  // ===========================================================
  // BUYER REGISTRATIONS
  // ===========================================================

  for (const buyer of recentBuyers) {
    activity.push({
      id:
        `buyer-${buyer._id.toString()}`,

      type: 'BUYER',

      icon: 'B',

      title:
        'New buyer registered',

      description:
        buyer.name
          ? `${buyer.name} created an account`
          : 'A new buyer created an account',

      createdAt:
        buyer.createdAt,
    })
  }


  // ===========================================================
  // NEW ORDERS
  // ===========================================================

  for (const order of recentOrders) {
    activity.push({
      id:
        `order-${order._id.toString()}`,

      type: 'ORDER',

      icon: 'O',

      title:
        'New order received',

      description:
        `Order #${order._id.toString()} was placed`,

      createdAt:
        order.createdAt,
    })
  }


  // ===========================================================
  // PAYMENTS
  // ===========================================================

  for (const order of recentPayments) {
    activity.push({
      id:
        `payment-${order._id.toString()}`,

      type: 'PAYMENT',

      icon: '₹',

      title:
        'Payment received',

      description:
        `Payment for order #${order._id.toString()} completed`,

      createdAt:
        order.updatedAt ||
        order.createdAt,
    })
  }


  // ===========================================================
  // SORT NEWEST FIRST
  // ===========================================================

  activity.sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  )


  // ===========================================================
  // LIMIT DASHBOARD ACTIVITY
  // ===========================================================

  return activity.slice(0, 4)
}


// =============================================================
// CREATE ACTIVITY BUCKETS
// =============================================================

function createActivityBuckets(
  periodStart,
  periodEnd,
  dailyActivity,
) {
  const dailyMap = new Map(
    dailyActivity.map((item) => [
      item._id,
      Number(item.revenue || 0),
    ]),
  )


  const totalDays =
    Math.max(
      1,
      Math.ceil(
        (
          periodEnd.getTime() -
          periodStart.getTime()
        ) /
          (1000 * 60 * 60 * 24),
      ),
    )


  const bucketCount = 8

  const buckets = []


  for (
    let bucketIndex = 0;
    bucketIndex < bucketCount;
    bucketIndex += 1
  ) {
    const bucketStartDay =
      Math.floor(
        (
          bucketIndex *
          totalDays
        ) /
          bucketCount,
      )


    const bucketEndDay =
      Math.floor(
        (
          (bucketIndex + 1) *
          totalDays
        ) /
          bucketCount,
      ) - 1


    let value = 0


    for (
      let dayIndex = bucketStartDay;
      dayIndex <= bucketEndDay;
      dayIndex += 1
    ) {
      const date =
        new Date(periodStart)


      date.setDate(
        date.getDate() +
          dayIndex,
      )


      const dateKey =
        formatDateKey(date)


      value +=
        dailyMap.get(dateKey) ??
        0
    }


    const labelDate =
      new Date(periodStart)


    labelDate.setDate(
      labelDate.getDate() +
        bucketStartDay,
    )


    buckets.push({
      label:
        labelDate.toLocaleDateString(
          'en-IN',
          {
            day: 'numeric',
            month: 'short',
          },
        ),

      value,
    })
  }


  return buckets
}


// =============================================================
// DATE KEY
// =============================================================

function formatDateKey(date) {
  const year =
    date.getFullYear()


  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')


  const day =
    String(
      date.getDate(),
    ).padStart(2, '0')


  return `${year}-${month}-${day}`
}

// =============================================================
// ADMIN RECENT ACTIVITY
// =============================================================

export async function getAdminRecentActivity() {
  const database = getDatabase()

  const usersCollection =
    database.collection(USERS_COLLECTION)

  const ordersCollection =
    database.collection(ORDERS_COLLECTION)


  const [
    recentCreators,
    recentBuyers,
    recentOrders,
    recentPayments,
  ] = await Promise.all([

    // =========================================================
    // RECENT CREATOR REGISTRATIONS
    // =========================================================

    usersCollection
      .find({
        role: 'CREATOR',
      })
      .sort({
        createdAt: -1,
      })
      .limit(25)
      .toArray(),


    // =========================================================
    // RECENT BUYER REGISTRATIONS
    // =========================================================

    usersCollection
      .find({
        role: 'BUYER',
      })
      .sort({
        createdAt: -1,
      })
      .limit(25)
      .toArray(),


    // =========================================================
    // RECENT ORDERS
    // =========================================================

    ordersCollection
      .find({})
      .sort({
        createdAt: -1,
      })
      .limit(25)
      .toArray(),


    // =========================================================
    // RECENT PAYMENTS
    // =========================================================

    ordersCollection
      .find({
        status: 'PAID',
      })
      .sort({
        updatedAt: -1,
      })
      .limit(25)
      .toArray(),

  ])


  // =========================================================
  // BUILD COMBINED ACTIVITY
  // =========================================================

  const activity = []


  // =========================================================
  // CREATOR REGISTRATIONS
  // =========================================================

  for (const creator of recentCreators) {

    activity.push({
      id:
        `creator-${creator._id.toString()}`,

      type: 'CREATOR',

      title:
        'New creator registered',

      message:
        creator.name ||
        'A new creator joined the marketplace',

      createdAt:
        creator.createdAt,
    })
  }


  // =========================================================
  // BUYER REGISTRATIONS
  // =========================================================

  for (const buyer of recentBuyers) {

    activity.push({
      id:
        `buyer-${buyer._id.toString()}`,

      type: 'BUYER',

      title:
        'New buyer registered',

      message:
        buyer.name ||
        'A new buyer joined the marketplace',

      createdAt:
        buyer.createdAt,
    })
  }


  // =========================================================
  // NEW ORDERS
  // =========================================================

  for (const order of recentOrders) {

    activity.push({
      id:
        `order-${order._id.toString()}`,

      type: 'ORDER',

      referenceId:
        order._id.toString(),

      title:
        'New order received',

      message:
        `Order #${order._id.toString()} was placed`,

      createdAt:
        order.createdAt,
    })
  }


  // =========================================================
  // PAYMENTS
  // =========================================================

  for (const order of recentPayments) {

    activity.push({
      id:
        `payment-${order._id.toString()}`,

      type: 'PAYMENT',

      referenceId:
        order._id.toString(),

      title:
        'Payment received',

      message:
        `Payment for order #${order._id.toString()} completed`,

      createdAt:
        order.updatedAt ||
        order.createdAt,
    })
  }


  // =========================================================
  // SORT NEWEST FIRST
  // =========================================================

  activity.sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  )


  // =========================================================
  // RETURN LATEST 50 EVENTS
  // =========================================================

  return activity.slice(0, 50)
}

// =============================================================
// ACCOUNT SECURITY
// =============================================================

const ONLINE_WINDOW_MS =
  90 * 1000


// =============================================================
// GET CREATOR / BUYER SECURITY STATUS
// =============================================================

export async function getAccountSecurityUsers() {
  const database = getDatabase()

  const usersCollection =
    database.collection(USERS_COLLECTION)


  const users =
    await usersCollection
      .find({
        role: {
          $in: [
            'CREATOR',
            'BUYER',
          ],
        },
      })
      .sort({
        role: 1,
        name: 1,
      })
      .toArray()


  const now =
    Date.now()


  return users.map((user) => {
    const lastSeenTime =
      user.lastSeenAt
        ? new Date(
            user.lastSeenAt,
          ).getTime()
        : 0


    const isOnline =
      lastSeenTime > 0 &&
      now - lastSeenTime <=
        ONLINE_WINDOW_MS


    return {
      id:
        user._id.toString(),

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,

      suspended:
        user.suspended === true,

      suspensionReason:
        user.suspensionReason ??
        null,

      suspendedAt:
        user.suspendedAt ??
        null,

      lastSeenAt:
        user.lastSeenAt ??
        null,

      isOnline,
    }
  })
}


// =============================================================
// SUSPEND USER
// =============================================================

export async function suspendUser(
  userId,
  reason,
) {
  if (!ObjectId.isValid(userId)) {
    return null
  }


  const trimmedReason =
    String(
      reason ?? '',
    ).trim()


  if (!trimmedReason) {
    return {
      error:
        'SUSPENSION_REASON_REQUIRED',
    }
  }


  const database = getDatabase()

  const usersCollection =
    database.collection(USERS_COLLECTION)


  const now =
    new Date()


  const result =
    await usersCollection.findOneAndUpdate(
      {
        _id:
          new ObjectId(
            userId,
          ),

        role: {
          $in: [
            'CREATOR',
            'BUYER',
          ],
        },
      },

      {
        $set: {
          suspended: true,

          suspensionReason:
            trimmedReason,

          suspendedAt:
            now,

          updatedAt:
            now,
        },
      },

      {
        returnDocument:
          'after',
      },
    )


  if (!result) {
    return null
  }


  return {
    id:
      result._id.toString(),

    name:
      result.name,

    email:
      result.email,

    role:
      result.role,

    suspended:
      result.suspended === true,

    suspensionReason:
      result.suspensionReason ??
      null,

    suspendedAt:
      result.suspendedAt ??
      null,
  }
}


// =============================================================
// UNSUSPEND USER
// =============================================================

export async function unsuspendUser(
  userId,
) {
  if (!ObjectId.isValid(userId)) {
    return null
  }


  const database = getDatabase()

  const usersCollection =
    database.collection(USERS_COLLECTION)


  const result =
    await usersCollection.findOneAndUpdate(
      {
        _id:
          new ObjectId(
            userId,
          ),

        role: {
          $in: [
            'CREATOR',
            'BUYER',
          ],
        },
      },

      {
        $set: {
          suspended: false,

          suspensionReason:
            null,

          suspendedAt:
            null,

          updatedAt:
            new Date(),
        },
      },

      {
        returnDocument:
          'after',
      },
    )


  if (!result) {
    return null
  }


  return {
    id:
      result._id.toString(),

    name:
      result.name,

    email:
      result.email,

    role:
      result.role,

    suspended:
      false,

    suspensionReason:
      null,

    suspendedAt:
      null,
  }
}