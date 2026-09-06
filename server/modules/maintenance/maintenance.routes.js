import { Router } from 'express'

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import {
  activateMaintenance,
  deactivateMaintenance,
  getMaintenanceStatus,
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