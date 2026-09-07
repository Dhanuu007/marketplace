import { Router } from 'express'

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import {
  activateMaintenance,
  deactivateMaintenance,
  getMaintenanceStatus,
  saveMaintenanceMessage,
} from './maintenance.service.js'


const router = Router()


// =========================================================
// PUBLIC MAINTENANCE STATUS
// =========================================================

router.get(
  '/maintenance/status',
  async (request, response, next) => {
    try {
      const maintenance =
        await getMaintenanceStatus()


      return response.json({
        maintenance,
      })
    } catch (error) {
      return next(error)
    }
  },
)

// =========================================================
// UPDATE MAINTENANCE MESSAGE
// =========================================================

router.post(
  '/admin/maintenance/message',

  requireAuth,

  requireRole('ADMIN'),

  async (request, response, next) => {
    try {
      const message =
        typeof request.body?.message === 'string'
          ? request.body.message.trim()
          : ''


      if (message.length > 500) {
        return response.status(400).json({
          message:
            'Maintenance message must be 500 characters or less.',
        })
      }


      const maintenance =
        await saveMaintenanceMessage(
          message,
        )


      return response.json({
        maintenance,

        message:
          'Maintenance message saved successfully.',
      })
    } catch (error) {
      return next(error)
    }
  },
)


// =========================================================
// ENABLE MAINTENANCE
// =========================================================

router.post(
  '/admin/maintenance/enable',

  requireAuth,

  requireRole('ADMIN'),

  async (request, response, next) => {
    try {
      const maintenance =
        await activateMaintenance()


      return response.json({
        maintenance,

        message:
          'Maintenance mode enabled successfully.',
      })
    } catch (error) {
      return next(error)
    }
  },
)


// =========================================================
// DISABLE MAINTENANCE
// =========================================================

router.post(
  '/admin/maintenance/disable',

  requireAuth,

  requireRole('ADMIN'),

  async (request, response, next) => {
    try {
      const maintenance =
        await deactivateMaintenance()


      return response.json({
        maintenance,

        message:
          'Maintenance mode disabled successfully.',
      })
    } catch (error) {
      return next(error)
    }
  },
)


export default router