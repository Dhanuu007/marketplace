import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'

const COLLECTION_NAME = 'orders'

function orderCollection() {
  return getDatabase().collection(COLLECTION_NAME)
}

let indexesReady = false

async function ensureOrderIndexes() {
  if (indexesReady) return

  await orderCollection().createIndex({
    userId: 1,
    createdAt: -1,
  })

  await orderCollection().createIndex({
    status: 1,
    createdAt: -1,
  })

  await orderCollection().createIndex({
    razorpayOrderId: 1,
  })

  indexesReady = true
}

export async function createOrder(order) {
  await ensureOrderIndexes()

  const now = new Date()

  const document = {
    ...order,
    createdAt: now,
    updatedAt: now,
  }

  const result = await orderCollection().insertOne(
    document,
  )

  return orderCollection().findOne({
    _id: result.insertedId,
  })
}

export async function getAllOrders() {
  await ensureOrderIndexes()

  return orderCollection()
    .find({})
    .sort({
      createdAt: -1,
    })
    .toArray()
}

export async function deleteOrder(orderId) {
  await ensureOrderIndexes()

  if (!ObjectId.isValid(orderId)) {
    return null
  }

  const result =
    await orderCollection().findOneAndDelete({
      _id: new ObjectId(orderId),
    })

  return result
    ? result
    : null
}

export async function getOrdersByUserId(userId) {
  await ensureOrderIndexes()

  if (!ObjectId.isValid(userId)) {
    return []
  }

  return orderCollection()
    .find({
      userId,
    })
    .sort({
      createdAt: -1,
    })
    .toArray()
}

export async function updateOrderStatus(
  orderId,
  status,
) {
  await ensureOrderIndexes()

  if (!ObjectId.isValid(orderId)) {
    return null
  }

  const result = await orderCollection().findOneAndUpdate(
    {
      _id: new ObjectId(orderId),
    },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
    },
  )

  return result
    ? result
    : null
}

export async function updateOrderPayment(
  orderId,
  razorpayOrderId,
) {
  await ensureOrderIndexes()

  if (!ObjectId.isValid(orderId)) {
    return null
  }

  if (
    typeof razorpayOrderId !== 'string' ||
    razorpayOrderId.trim() === ''
  ) {
    return null
  }

  const result = await orderCollection().findOneAndUpdate(
    {
      _id: new ObjectId(orderId),
    },
    {
      $set: {
        razorpayOrderId:
          razorpayOrderId.trim(),

        updatedAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
    },
  )

  return result
    ? result
    : null
}


/*
 * Find a Marketplace order using the Razorpay
 * Order ID.
 *
 * This is used by server-side Razorpay payment
 * processing/webhooks where there is no logged-in
 * Marketplace user available.
 */
export async function getOrderByRazorpayOrderId(
  razorpayOrderId,
) {
  await ensureOrderIndexes()

  if (
    typeof razorpayOrderId !== 'string' ||
    razorpayOrderId.trim() === ''
  ) {
    return null
  }

  return orderCollection().findOne({
    razorpayOrderId:
      razorpayOrderId.trim(),
  })
}


export async function getOrderById(
  orderId,
  userId,
) {
  await ensureOrderIndexes()

  if (!ObjectId.isValid(orderId)) {
    return null
  }

  return orderCollection().findOne({
    _id: new ObjectId(orderId),
    userId,
  })
}

export async function getOrdersByCreatorId(creatorId) {
  await ensureOrderIndexes()

  if (!creatorId) {
    return []
  }

  return orderCollection()
    .find({
      items: {
        $elemMatch: {
          creatorId,
        },
      },
    })
    .sort({
      createdAt: -1,
    })
    .toArray()
}

export async function updateOrderItemDelivery(
  orderId,
  productId,
  creatorId,
  delivery,
) {
  await ensureOrderIndexes()

  if (!ObjectId.isValid(orderId)) {
    return null
  }

  const result = await orderCollection().findOneAndUpdate(
    {
      _id: new ObjectId(orderId),

      /*
       * A Creator may only provide delivery after
       * the Marketplace order has been paid.
       */
      status: 'PAID',

      items: {
        $elemMatch: {
          productId,
          creatorId,
        },
      },
    },
    {
      $set: {
        'items.$.delivery': delivery,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
    },
  )

  return result
    ? result
    : null
}


/*
 * Automatically mark the purchased website items
 * as delivered after successful payment.
 *
 * The actual website ZIP is already stored in
 * item.websiteZip when the order is created.
 *
 * This function only changes the delivery state.
 * It does not replace or remove the stored ZIP.
 */
export async function markOrderItemsDelivered(
  orderId,
) {
  await ensureOrderIndexes()

  if (!ObjectId.isValid(orderId)) {
    return null
  }

  const now = new Date()

  const result = await orderCollection().findOneAndUpdate(
    {
      _id: new ObjectId(orderId),

      items: {
        $elemMatch: {
          websiteZip: {
            $exists: true,
          },
        },
      },
    },
    {
      $set: {
        'items.$[item].delivery.status':
          'DELIVERED',

        'items.$[item].delivery.deliveredAt':
          now,

        updatedAt: now,
      },
    },
    {
      arrayFilters: [
        {
          'item.websiteZip': {
            $exists: true,
          },
        },
      ],

      returnDocument: 'after',
    },
  )

  return result
    ? result
    : null
}