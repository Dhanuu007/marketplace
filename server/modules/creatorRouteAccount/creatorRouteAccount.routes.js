import { Router } from 'express'


import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'


import {
  getCreatorRouteAccount,
} from './creatorRouteAccount.service.js'


const router = Router()


/*
 * Get the current Creator's Razorpay Route
 * onboarding status.
 *
 * This endpoint is read-only.
 * It does NOT create anything in Razorpay.
 */
router.get(
  '/creator/route-account',
  requireAuth,
  requireRole('CREATOR'),
  async (request, response, next) => {
    try {
      const routeAccount =
        await getCreatorRouteAccount(
          request.user.id,
        )


      response.json({
        routeAccount,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router