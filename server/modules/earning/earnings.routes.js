import { Router } from 'express'


import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'


import {
  getCreatorEarnings,
  getAdminPayouts,
  markCreatorEarningAsPaid,
} from './earnings.service.js'


const router = Router()


// Get earnings for current Creator
router.get(
  '/creator/earnings',
  requireAuth,
  requireRole('CREATOR'),
  async (request, response, next) => {
    try {
      const earnings =
        await getCreatorEarnings(
          request.user.id,
        )


      response.json({
        earnings,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Get all payouts for Admin
router.get(
  '/admin/payouts',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const payouts =
        await getAdminPayouts()


      response.json({
        payouts,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Mark one pending payout as paid
router.patch(
  '/admin/payouts/:earningId/paid',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const payout =
        await markCreatorEarningAsPaid(
          request.params.earningId,
        )


      response.json({
        payout,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router