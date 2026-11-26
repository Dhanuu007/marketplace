
import { Router } from 'express'

import {
  requireAuth,
} from '../../middleware/auth.js'

import {
  publishAdminAnnouncement,
  getAdminAnnouncements,
  getPublicAnnouncements,
  deleteAdminAnnouncement,
} from './announcement.service.js'


const router = Router()


// =========================================================
// GET PUBLIC ANNOUNCEMENTS
// Homepage, Buyer and Creator dashboards
// =========================================================

router.get(
  '/announcements',
  async (request, response, next) => {
    try {
      const announcements =
        await getPublicAnnouncements()

      return response.json({
        announcements,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// GET ALL ANNOUNCEMENTS FOR ADMIN
// =========================================================

router.get(
  '/admin/announcements',
  requireAuth,
  async (request, response, next) => {
    try {
      if (request.user.role !== 'ADMIN') {
        return response.status(403).json({
          error: {
            message: 'Admin access required.',
          },
        })
      }

      const announcements =
        await getAdminAnnouncements()

      return response.json({
        announcements,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// PUBLISH ANNOUNCEMENT
// =========================================================

router.post(
  '/admin/announcements',
  requireAuth,
  async (request, response, next) => {
    try {
      if (request.user.role !== 'ADMIN') {
        return response.status(403).json({
          error: {
            message: 'Admin access required.',
          },
        })
      }

      const result =
        await publishAdminAnnouncement({
          title: request.body?.title,
          message: request.body?.message,
          adminId: request.user.id,
        })

      return response.status(201).json({
        status: 'success',
        ...result,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// DELETE ANNOUNCEMENT (SOFT DELETE)
// Admin only
// =========================================================

router.delete(
  '/admin/announcements/:id',
  requireAuth,
  async (request, response, next) => {
    try {
      if (request.user.role !== 'ADMIN') {
        return response.status(403).json({
          error: {
            message: 'Admin access required.',
          },
        })
      }

      const result =
        await deleteAdminAnnouncement(request.params.id)

      return response.json({
        status: 'success',
        message: 'Announcement deleted successfully.',
        ...result,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router
