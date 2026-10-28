
import { Router } from 'express'

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import {
  activateMaintenance,
  deactivateMaintenance,
  getMaintenanceStatus,
  saveMaintenanceAppearance,
  saveMaintenanceEndTime,
  saveMaintenanceMessage,
} from './maintenance.service.js'

const router = Router()

// PUBLIC MAINTENANCE STATUS

router.get(
  '/maintenance/status',
  async (request, response, next) => {
    try {
      const maintenance = await getMaintenanceStatus()

      return response.json({ maintenance })
    } catch (error) {
      return next(error)
    }
  },
)

// UPDATE MAINTENANCE MESSAGE

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
        await saveMaintenanceMessage(message)

      return response.json({
        maintenance,
        message: 'Maintenance message saved successfully.',
      })
    } catch (error) {
      return next(error)
    }
  },
)

// UPDATE MAINTENANCE APPEARANCE

router.post(
  '/admin/maintenance/appearance',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const maintenance =
        await saveMaintenanceAppearance(
          request.body?.appearance,
        )

      return response.json({
        maintenance,
        message: 'Maintenance appearance saved successfully.',
      })
    } catch (error) {
      return next(error)
    }
  },
)

// SET OR CLEAR MAINTENANCE END TIME

router.post(
  '/admin/maintenance/schedule',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const { endAt } = request.body ?? {}

      if (
        endAt !== null &&
        typeof endAt !== 'string'
      ) {
        return response.status(400).json({
          message:
            'Provide an endAt timestamp or null to clear the schedule.',
        })
      }

      const maintenance =
        await saveMaintenanceEndTime(endAt)

      return response.json({
        maintenance,
        message:
          endAt === null
            ? 'Maintenance schedule cleared.'
            : 'Maintenance end time saved successfully.',
      })
    } catch (error) {
      return next(error)
    }
  },
)

// ENABLE MAINTENANCE

router.post(
  '/admin/maintenance/enable',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const maintenance = await activateMaintenance()

      return response.json({
        maintenance,
        message: 'Maintenance mode enabled successfully.',
      })
    } catch (error) {
      return next(error)
    }
  },
)

// DISABLE MAINTENANCE

router.post(
  '/admin/maintenance/disable',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const maintenance = await deactivateMaintenance()

      return response.json({
        maintenance,
        message: 'Maintenance mode disabled successfully.',
      })
    } catch (error) {
      return next(error)
    }
  },
)

export default router
