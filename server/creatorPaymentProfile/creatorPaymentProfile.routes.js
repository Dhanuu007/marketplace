import { Router } from 'express'



import {
  requireAuth,
  requireRole,
} from '../middleware/auth.js'



import {
  getCreatorPaymentProfile,
  saveCreatorPaymentProfile,
  removeCreatorPaymentProfile,
} from './creatorPaymentProfile.service.js'



const router = Router()



// Get current Creator payment profile
router.get(
  '/creator/payment-profile',
  requireAuth,
  requireRole('CREATOR'),
  async (request, response, next) => {
    try {
      const paymentProfile =
        await getCreatorPaymentProfile(
          request.user.id,
        )


      response.json({
        paymentProfile,
      })
    } catch (error) {
      next(error)
    }
  },
)



// Create or update current Creator payment profile
router.put(
  '/creator/payment-profile',
  requireAuth,
  requireRole('CREATOR'),
  async (request, response, next) => {
    try {
      const paymentProfile =
        await saveCreatorPaymentProfile(
          request.user.id,
          request.body,
        )


      response.json({
        paymentProfile,
      })
    } catch (error) {
      next(error)
    }
  },
)



// Delete current Creator payment profile
router.delete(
  '/creator/payment-profile',
  requireAuth,
  requireRole('CREATOR'),
  async (request, response, next) => {
    try {
      const paymentProfile =
        await removeCreatorPaymentProfile(
          request.user.id,
        )


      response.json({
        paymentProfile,
      })
    } catch (error) {
      next(error)
    }
  },
)



export default router