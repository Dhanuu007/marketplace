import { Router } from 'express'

import {
  requireAuth,
} from '../../middleware/auth.js'

import {
  createPaymentOrder,
  verifyPayment,
} from './payment.service.js'


const router = Router()


// Create Razorpay payment order
router.post(
  '/payments/create-order',
  requireAuth,
  async (request, response, next) => {
    try {
      const orderId =
        request.body?.orderId


      if (
        typeof orderId !== 'string' ||
        orderId.trim() === ''
      ) {
        const error = new Error(
          'Order ID is required.',
        )

        error.statusCode = 400

        throw error
      }


      const paymentOrder =
        await createPaymentOrder(
          orderId.trim(),
          request.user.id,
        )


      response.status(201).json({
        paymentOrder,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Verify Razorpay payment
router.post(
  '/payments/verify',
  requireAuth,
  async (request, response, next) => {
    try {
      const orderId =
        request.body?.orderId

      const razorpayOrderId =
        request.body?.razorpayOrderId

      const razorpayPaymentId =
        request.body?.razorpayPaymentId

      const razorpaySignature =
        request.body?.razorpaySignature


      if (
        typeof orderId !== 'string' ||
        orderId.trim() === ''
      ) {
        const error = new Error(
          'Order ID is required.',
        )

        error.statusCode = 400

        throw error
      }


      if (
        typeof razorpayOrderId !== 'string' ||
        razorpayOrderId.trim() === ''
      ) {
        const error = new Error(
          'Razorpay order ID is required.',
        )

        error.statusCode = 400

        throw error
      }


      if (
        typeof razorpayPaymentId !== 'string' ||
        razorpayPaymentId.trim() === ''
      ) {
        const error = new Error(
          'Razorpay payment ID is required.',
        )

        error.statusCode = 400

        throw error
      }


      if (
        typeof razorpaySignature !== 'string' ||
        razorpaySignature.trim() === ''
      ) {
        const error = new Error(
          'Razorpay payment signature is required.',
        )

        error.statusCode = 400

        throw error
      }


      const verification =
        await verifyPayment(
          orderId.trim(),
          request.user.id,
          razorpayOrderId.trim(),
          razorpayPaymentId.trim(),
          razorpaySignature.trim(),
        )


      response.status(200).json({
        verification,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router