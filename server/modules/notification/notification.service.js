import {
  createNotification,
  getNotificationsByRecipientId,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from './notification.repository.js'


/*
 * Create a notification.
 *
 * recipientId is ALWAYS the user who should
 * RECEIVE the notification.
 *
 * It must never be the sender.
 */
export async function createUserNotification({
  recipientId,
  recipientRole,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
}) {
  if (!recipientId) {
    return null
  }

  if (!recipientRole) {
    return null
  }

  if (!type) {
    return null
  }

  if (!title) {
    return null
  }

  if (!message) {
    return null
  }

  const notification =
    await createNotification({
      recipientId,
      recipientRole,
      type,
      title,
      message,
      relatedId,
      relatedType,
    })

  return serializeNotification(
    notification,
  )
}


/*
 * Get notifications for the
 * currently authenticated user.
 */
export async function getUserNotifications(
  userId,
) {
  const notifications =
    await getNotificationsByRecipientId(
      userId,
    )

  return notifications.map(
    serializeNotification,
  )
}


/*
 * Get unread notification count.
 */
export async function getUserUnreadNotificationCount(
  userId,
) {
  return getUnreadNotificationCount(
    userId,
  )
}


/*
 * Mark one notification as read.
 *
 * recipientId is included in the repository
 * query so a user cannot mark another user's
 * notification as read.
 */
export async function markUserNotificationRead(
  notificationId,
  userId,
) {
  const notification =
    await markNotificationRead(
      notificationId,
      userId,
    )

  if (!notification) {
    return null
  }

  return serializeNotification(
    notification,
  )
}


/*
 * Mark every notification belonging to
 * the current user as read.
 */
export async function markAllUserNotificationsRead(
  userId,
) {
  const result =
    await markAllNotificationsRead(
      userId,
    )

  return {
    matchedCount:
      result?.matchedCount ?? 0,

    modifiedCount:
      result?.modifiedCount ?? 0,
  }
}


/*
 * ---------------------------------------------------------
 * CHAT NOTIFICATIONS
 * ---------------------------------------------------------
 *
 * These helpers make the sender/receiver relationship
 * explicit.
 *
 * BUYER sends message
 *      ↓
 * CREATOR receives notification
 *
 * CREATOR sends message
 *      ↓
 * BUYER receives notification
 */


/*
 * Create notification for a new chat message.
 */
export async function createChatMessageNotification({
  conversation,
  sender,
}) {
  if (
    !conversation ||
    !sender
  ) {
    return null
  }


  /*
   * Buyer message → Creator notification.
   */
  if (
    sender.role === 'BUYER'
  ) {
    return createUserNotification({
      recipientId:
        conversation.creatorId,

      recipientRole:
        'CREATOR',

      type:
        'NEW_MESSAGE',

      title:
        'New message from buyer',

      message:
        `You received a new message from a buyer about ${conversation.productName || 'your website'}.`,

      relatedId:
        conversation.id ||
        conversation._id?.toString(),

      relatedType:
        'CONVERSATION',
    })
  }


  /*
   * Creator message → Buyer notification.
   */
  if (
    sender.role === 'CREATOR'
  ) {
    return createUserNotification({
      recipientId:
        conversation.buyerId,

      recipientRole:
        'BUYER',

      type:
        'NEW_MESSAGE',

      title:
        'New message from creator',

      message:
        `You received a new message from the creator about ${conversation.productName || 'your purchased website'}.`,

      relatedId:
        conversation.id ||
        conversation._id?.toString(),

      relatedType:
        'CONVERSATION',
    })
  }


  return null
}


/*
 * Serialize notification before sending
 * it to the frontend.
 */
function serializeNotification(
  notification,
) {
  if (!notification) {
    return null
  }


  return {
    id:
      notification._id.toString(),

    recipientId:
      notification.recipientId,

    recipientRole:
      notification.recipientRole,

    type:
      notification.type,

    title:
      notification.title,

    message:
      notification.message,

    relatedId:
      notification.relatedId ??
      null,

    relatedType:
      notification.relatedType ??
      null,

    read:
      Boolean(
        notification.read,
      ),

    createdAt:
      notification.createdAt,

    updatedAt:
      notification.updatedAt,
  }
}