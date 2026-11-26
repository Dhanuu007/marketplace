
import {
  createAnnouncement,
  getAllAnnouncements,
  getPublishedAnnouncements,
  deleteAnnouncement,
} from './announcement.repository.js'

import {
  findUsersByRole,
} from '../auth/user.repository.js'

import {
  createUserNotification,
} from '../notification/notification.service.js'

import {
  NOTIFICATION_TYPES,
} from '../notification/notification.constants.js'


/*
 * SERIALIZE ANNOUNCEMENT
 */
function serializeAnnouncement(announcement) {
  if (!announcement) return null

  return {
    id: announcement._id.toString(),
    title: announcement.title,
    message: announcement.message,
    adminId: announcement.adminId,
    audience: announcement.audience ?? [],
    status: announcement.status,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  }
}


/*
 * PUBLISH ANNOUNCEMENT
 *
 * Sends an announcement to all Buyers
 * and Creators through notifications.
 */
export async function publishAdminAnnouncement({
  title,
  message,
  adminId,
}) {
  const cleanTitle = title?.trim()
  const cleanMessage = message?.trim()

  if (!cleanTitle || !cleanMessage) {
    const error = new Error(
      'Announcement title and message are required.',
    )

    error.statusCode = 400
    throw error
  }

  if (cleanTitle.length > 120) {
    const error = new Error(
      'Announcement title cannot exceed 120 characters.',
    )

    error.statusCode = 400
    throw error
  }

  if (cleanMessage.length > 2000) {
    const error = new Error(
      'Announcement message cannot exceed 2000 characters.',
    )

    error.statusCode = 400
    throw error
  }

  // Save the announcement centrally.
  const announcement = await createAnnouncement({
    title: cleanTitle,
    message: cleanMessage,
    adminId,
  })

  // Find all Buyers and Creators.
  const [buyers, creators] = await Promise.all([
    findUsersByRole('BUYER'),
    findUsersByRole('CREATOR'),
  ])

  const recipients = [...buyers, ...creators]

  // Generate an individual notification for each user.
  const results = await Promise.allSettled(
    recipients.map((user) =>
      createUserNotification({
        recipientId: user.id,
        recipientRole: user.role,

        type: NOTIFICATION_TYPES.ADMIN_ANNOUNCEMENT,

        title: cleanTitle,
        message: cleanMessage,

        relatedId: announcement._id.toString(),
        relatedType: 'ADMIN_ANNOUNCEMENT',
      }),
    ),
  )

  const successfulNotifications = results.filter(
    (result) => result.status === 'fulfilled' && result.value,
  ).length

  const failedNotifications =
    recipients.length - successfulNotifications

  return {
    announcement: serializeAnnouncement(announcement),

    totalRecipients: recipients.length,

    successfulNotifications,

    failedNotifications,
  }
}


/*
 * GET ANNOUNCEMENTS FOR ADMIN
 */
export async function getAdminAnnouncements() {
  const announcements = await getAllAnnouncements()

  return announcements.map(serializeAnnouncement)
}


/*
 * GET PUBLIC ANNOUNCEMENTS
 *
 * Used by Buyer, Creator and homepage.
 */
export async function getPublicAnnouncements() {
  const announcements = await getPublishedAnnouncements()

  return announcements.map(serializeAnnouncement)
}


/*
 * DELETE ANNOUNCEMENT
 *
 * Soft delete: keeps the database record
 * but removes it from active announcements.
 */
export async function deleteAdminAnnouncement(id) {
  const deleted = await deleteAnnouncement(id)

  if (!deleted) {
    const error = new Error(
      'Announcement not found or already deleted.',
    )

    error.statusCode = 404
    throw error
  }

  return {
    id,
    status: 'DELETED',
  }
}
