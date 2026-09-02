import { Router } from 'express'

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import {
  getAdminDashboardStats,
  getAdminRecentActivity,
  getAccountSecurityUsers,
  suspendUser,
  unsuspendUser,
} from './admin.service.js'

const router = Router()


// =========================================================
// ADMIN DASHBOARD
// =========================================================

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


// =========================================================
// ADMIN ACTIVITY
// =========================================================

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


// =========================================================
// ACCOUNT SECURITY
// =========================================================

router.get(
  '/admin/account-security',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const users =
        await getAccountSecurityUsers()

      response.json({
        users,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// SUSPEND USER
// =========================================================

router.post(
  '/admin/account-security/:userId/suspend',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const {
        userId,
      } = request.params

      const {
        reason,
      } = request.body


      const result =
        await suspendUser(
          userId,
          reason,
        )


      if (
        result?.error ===
        'SUSPENSION_REASON_REQUIRED'
      ) {
        return response.status(400).json({
          code:
            'SUSPENSION_REASON_REQUIRED',

          message:
            'A suspension reason is required.',
        })
      }


      if (!result) {
        return response.status(404).json({
          code:
            'USER_NOT_FOUND',

          message:
            'Creator or Buyer account was not found.',
        })
      }


      return response.json({
        user:
          result,

        message:
          'Account suspended successfully.',
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// UNSUSPEND USER
// =========================================================

router.post(
  '/admin/account-security/:userId/unsuspend',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const {
        userId,
      } = request.params

      const result =
        await unsuspendUser(
          userId,
        )


      if (!result) {
        return response.status(404).json({
          code:
            'USER_NOT_FOUND',

          message:
            'Creator or Buyer account was not found.',
        })
      }


      return response.json({
        user:
          result,

        message:
          'Account unsuspended successfully.',
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router