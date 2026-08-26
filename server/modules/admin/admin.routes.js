import { Router } from 'express'

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import {
  getAdminDashboardStats,
  getAdminRecentActivity,
} from './admin.service.js'

const router = Router()

router.get(
  '/admin/dashboard',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const stats =
        await getAdminDashboardStats()

      response.json({
        stats,
      })
    } catch (error) {
      next(error)
    }
  },
)

router.get(
  '/admin/activity',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const activity =
        await getAdminRecentActivity()

      response.json({
        activity,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router