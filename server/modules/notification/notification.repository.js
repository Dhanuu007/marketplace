import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'


const COLLECTION_NAME =
  'notifications'


function notificationCollection() {
  return getDatabase().collection(
    COLLECTION_NAME,
  )
}


let indexesReady = false


async function ensureNotificationIndexes() {
  if (indexesReady) {
    return
  }


  /*
   * Notifications are primarily queried
   * by recipient.
   */
  await notificationCollection().createIndex({
    recipientId: 1,
    createdAt: -1,
  })


  /*
   * Fast unread-count lookup.
   */
  await notificationCollection().createIndex({
    recipientId: 1,
    read: 1,
  })


  /*
   * Useful for notification types.
   */
  await notificationCollection().createIndex({
    type: 1,
    createdAt: -1,
  })


  indexesReady = true
}


/*
 * =========================================================
 * CREATE NOTIFICATION
 * =========================================================
 */

export async function createNotification(
  notification,
) {
  await ensureNotificationIndexes()

  const now = new Date()

  const document = {
    ...notification,

    /*
     * New notifications are unread.
     */
    read: false,

    createdAt: now,

    updatedAt: now,
  }


  const result =
    await notificationCollection().insertOne(
      document,
    )


  return notificationCollection().findOne({
    _id:
      result.insertedId,
  })
}


/*
 * =========================================================
 * GET USER NOTIFICATIONS
 * =========================================================
 */

export async function getNotificationsByRecipientId(
  recipientId,
) {
  await ensureNotificationIndexes()


  if (
    typeof recipientId !== 'string' ||
    recipientId.trim() === ''
  ) {
    return []
  }


  return notificationCollection()
    .find({
      recipientId,
    })
    .sort({
      createdAt: -1,
    })
    .limit(50)
    .toArray()
}


/*
 * =========================================================
 * GET UNREAD COUNT
 * =========================================================
 */

export async function getUnreadNotificationCount(
  recipientId,
) {
  await ensureNotificationIndexes()


  if (
    typeof recipientId !== 'string' ||
    recipientId.trim() === ''
  ) {
    return 0
  }


  return notificationCollection().countDocuments({
    recipientId,

    read: false,
  })
}


/*
 * =========================================================
 * MARK ONE NOTIFICATION AS READ
 * =========================================================
 *
 * IMPORTANT:
 *
 * recipientId is included in the query.
 *
 * This prevents one user from marking
 * another user's notification as read.
 */

export async function markNotificationRead(
  notificationId,
  recipientId,
) {
  await ensureNotificationIndexes()


  if (
    !ObjectId.isValid(
      notificationId,
    )
  ) {
    return null
  }


  if (
    typeof recipientId !== 'string' ||
    recipientId.trim() === ''
  ) {
    return null
  }


  return notificationCollection()
    .findOneAndUpdate(
      {
        _id:
          new ObjectId(
            notificationId,
          ),

        recipientId,
      },

      {
        $set: {
          read: true,

          updatedAt:
            new Date(),
        },
      },

      {
        returnDocument:
          'after',
      },
    )
}


/*
 * =========================================================
 * MARK ALL NOTIFICATIONS AS READ
 * =========================================================
 */

export async function markAllNotificationsRead(
  recipientId,
) {
  await ensureNotificationIndexes()


  if (
    typeof recipientId !== 'string' ||
    recipientId.trim() === ''
  ) {
    return {
      matchedCount: 0,
      modifiedCount: 0,
    }
  }


  return notificationCollection()
    .updateMany(
      {
        recipientId,

        read: false,
      },

      {
        $set: {
          read: true,

          updatedAt:
            new Date(),
        },
      },
    )
}