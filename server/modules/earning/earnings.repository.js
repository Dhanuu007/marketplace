import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'


const COLLECTION_NAME = 'earnings'


function earningsCollection() {
  return getDatabase().collection(
    COLLECTION_NAME,
  )
}


let indexesReady = false


async function ensureEarningsIndexes() {
  if (indexesReady) return


  await earningsCollection().createIndex({
    creatorId: 1,
    createdAt: -1,
  })


  await earningsCollection().createIndex({
    orderId: 1,
    productId: 1,
  })


  await earningsCollection().createIndex({
    status: 1,
    createdAt: -1,
  })


  indexesReady = true
}


export async function createEarning(earning) {
  await ensureEarningsIndexes()


  const now = new Date()


  const document = {
    ...earning,

    createdAt: now,

    updatedAt: now,
  }


  const result =
    await earningsCollection().insertOne(
      document,
    )


  return earningsCollection().findOne({
    _id: result.insertedId,
  })
}


export async function getEarningsByCreatorId(
  creatorId,
) {
  await ensureEarningsIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    return []
  }


  return earningsCollection()
    .find({
      creatorId: creatorId.trim(),
    })
    .sort({
      createdAt: -1,
    })
    .toArray()
}


export async function getEarningByOrderAndProduct(
  orderId,
  productId,
) {
  await ensureEarningsIndexes()


  if (
    !ObjectId.isValid(orderId) ||
    typeof productId !== 'string' ||
    productId.trim() === ''
  ) {
    return null
  }


  return earningsCollection().findOne({
    orderId: orderId.trim(),

    productId: productId.trim(),
  })
}


/*
 * Get all Creator earnings.
 *
 * This is used by the Admin Payouts area.
 */
export async function getAllEarnings() {
  await ensureEarningsIndexes()


  return earningsCollection()
    .find({})
    .sort({
      createdAt: -1,
    })
    .toArray()
}


/*
 * Mark one Creator earning as paid.
 *
 * Payment details are snapshotted into the earning
 * record so future changes to the Creator's payment
 * profile do not change historical payout information.
 */
export async function markEarningAsPaid(
  earningId,
  paymentDetails,
) {
  await ensureEarningsIndexes()


  if (!ObjectId.isValid(earningId)) {
    return null
  }


  const now = new Date()


  const result =
    await earningsCollection().findOneAndUpdate(
      {
        _id: new ObjectId(earningId),

        status: 'PENDING',
      },
      {
        $set: {
          status: 'PAID',

          paidAt: now,

          paymentDetails,

          updatedAt: now,
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