
import {
  createNotification,
  getNotificationsByRecipientId,
  markNotificationRead,
  markAllNotificationsRead,
} from './notification.repository.js'

import { findUsersByRole } from '../auth/user.repository.js'

import { getAnnouncementById } from '../announcement/announcement.repository.js'

import { NOTIFICATION_TYPES } from './notification.constants.js'


/*
 * Check whether a notification should be visible.
 *
 * Only ADMIN_ANNOUNCEMENT notifications are checked.
 * Chat and other notifications remain untouched.
 */
async function isNotificationVisible(notification) {
  if (
    notification.type !== NOTIFICATION_TYPES.ADMIN_ANNOUNCEMENT ||
    notification.relatedType !== 'ADMIN_ANNOUNCEMENT'
  ) {
    return true
  }

  // Old notifications without an announcement reference
  // cannot be linked to a specific announcement.
  if (!notification.relatedId) {
    return true
  }

  const announcement =
    await getAnnouncementById(notification.relatedId)

  return announcement?.status === 'PUBLISHED'
}


/*
 * Filter notifications.
 */
async function filterVisibleNotifications(notifications) {
  const results = await Promise.all(
    notifications.map(async (notification) => ({
      notification,
      visible: await isNotificationVisible(notification),
    })),
  )

  return results
    .filter((result) => result.visible)
    .map((result) => result.notification)
}


/*
 * Create a notification.
 *
 * recipientId is ALWAYS the user who should
 * RECEIVE the notification.
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
  if (!recipientId || !recipientRole || !type || !title || !message) {
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

  return serializeNotification(notification)
}


/*
 * Get notifications for the currently
 * authenticated user.
 */
export async function getUserNotifications(userId) {
  const notifications =
    await getNotificationsByRecipientId(userId)

  const visibleNotifications =
    await filterVisibleNotifications(notifications)

  return visibleNotifications.map(serializeNotification)
}


/*
 * Get unread notification count.
 *
 * Uses the same visibility filter so deleted
 * announcements do not increase the unread count.
 */
export async function getUserUnreadNotificationCount(userId) {
  const notifications =
    await getNotificationsByRecipientId(userId)

  const visibleNotifications =
    await filterVisibleNotifications(notifications)

  return visibleNotifications.filter(
    (notification) => !notification.read,
  ).length
}


/*
 * Mark one notification as read.
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

  return serializeNotification(notification)
}


/*
 * Mark every notification belonging to
 * the current user as read.
 */
export async function markAllUserNotificationsRead(userId) {
  const result =
    await markAllNotificationsRead(userId)

  return {
    matchedCount: result?.matchedCount ?? 0,
    modifiedCount: result?.modifiedCount ?? 0,
  }
}


/*
 * ---------------------------------------------------------
 * CHAT NOTIFICATIONS
 * ---------------------------------------------------------
 *
 * BUYER sends message → CREATOR receives notification
 * CREATOR sends message → BUYER receives notification
 */

export async function createChatMessageNotification({
  conversation,
  sender,
}) {
  if (!conversation || !sender) {
    return null
  }

  /*
   * Buyer message → Creator notification.
   */
  if (sender.role === 'BUYER') {
    return createUserNotification({
      recipientId: conversation.creatorId,
      recipientRole: 'CREATOR',
      type: 'NEW_MESSAGE',
      title: 'New message from buyer',
      message: `You received a new message from a buyer about ${conversation.productName || 'your website'}.`,
      relatedId:
        conversation.id ||
        conversation._id?.toString(),
      relatedType: 'CONVERSATION',
    })
  }

  /*
   * Creator message → Buyer notification.
   */
  if (sender.role === 'CREATOR') {
    return createUserNotification({
      recipientId: conversation.buyerId,
      recipientRole: 'BUYER',
      type: 'NEW_MESSAGE',
      title: 'New message from creator',
      message: `You received a new message from the creator about ${conversation.productName || 'your purchased website'}.`,
      relatedId:
        conversation.id ||
        conversation._id?.toString(),
      relatedType: 'CONVERSATION',
    })
  }

  return null
}


/*
 * Serialize notification before sending
 * it to the frontend.
 */
function serializeNotification(notification) {
  if (!notification) {
    return null
  }

  return {
    id: notification._id.toString(),

    recipientId: notification.recipientId,

    recipientRole: notification.recipientRole,

    type: notification.type,

    title: notification.title,

    message: notification.message,

    relatedId: notification.relatedId ?? null,

    relatedType: notification.relatedType ?? null,

    read: Boolean(notification.read),

    createdAt: notification.createdAt,

    updatedAt: notification.updatedAt,
  }
}


/*
 * ---------------------------------------------------------
 * ADMIN ANNOUNCEMENTS
 * ---------------------------------------------------------
 */

export async function createAdminAnnouncement({
  title,
  message,
}) {
  const cleanTitle = title?.trim()
  const cleanMessage = message?.trim()

  if (!cleanTitle || !cleanMessage) {
    throw new Error(
      'Announcement title and message are required.',
    )
  }

  const [buyers, creators] = await Promise.all([
    findUsersByRole('BUYER'),
    findUsersByRole('CREATOR'),
  ])

  const recipients = [...buyers, ...creators]

  const results = await Promise.all(
    recipients.map((user) =>
      createUserNotification({
        recipientId: user.id,
        recipientRole: user.role,
        type: NOTIFICATION_TYPES.ADMIN_ANNOUNCEMENT,
        title: cleanTitle,
        message: cleanMessage,
        relatedType: 'ADMIN_ANNOUNCEMENT',
      }),
    ),
  )

  return {
    title: cleanTitle,
    message: cleanMessage,
    totalRecipients: results.filter(Boolean).length,
  }
}
