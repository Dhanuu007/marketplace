import { Router } from 'express'

import {
  requireAuth,
} from '../../middleware/auth.js'

import {
  getUserNotifications,
  getUserUnreadNotificationCount,
  markUserNotificationRead,
  markAllUserNotificationsRead,
} from './notification.service.js'


const router = Router()


// =========================================================
// GET USER NOTIFICATIONS
// =========================================================

router.get(
  '/notifications',
  requireAuth,
  async (request, response, next) => {
    try {
      const notifications =
        await getUserNotifications(
          request.user.id,
        )

      response.json({
        notifications,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// GET UNREAD NOTIFICATION COUNT
// =========================================================

router.get(
  '/notifications/unread-count',
  requireAuth,
  async (request, response, next) => {
    try {
      const count =
        await getUserUnreadNotificationCount(
          request.user.id,
        )

      response.json({
        count,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// MARK ONE NOTIFICATION AS READ
// =========================================================

router.patch(
  '/notifications/:notificationId/read',
  requireAuth,
  async (request, response, next) => {
    try {
      const notification =
        await markUserNotificationRead(
          request.params.notificationId,
          request.user.id,
        )

      if (!notification) {
        return response.status(404).json({
          error: {
            message:
              'Notification not found.',
          },
        })
      }

      return response.json({
        notification,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

router.patch(
  '/notifications/read-all',
  requireAuth,
  async (request, response, next) => {
    try {
      const result =
        await markAllUserNotificationsRead(
          request.user.id,
        )

      response.json({
        status: 'ok',
        ...result,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router