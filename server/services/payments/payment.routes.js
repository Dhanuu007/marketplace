import { Router } from 'express'

import {
  requireAuth,
} from '../../middleware/auth.js'

import {
  createPaymentOrder,
  verifyPayment,
  processRazorpayPayment,
} from './payment.service.js'

import {
  verifyRazorpayWebhook,
} from './payment.verification.js'


const router = Router()


// =========================================================
// RAZORPAY WEBHOOK
// =========================================================

router.post(
  '/payments/webhook',
  async (request, response, next) => {
    try {
      const signature =
        request.headers['x-razorpay-signature']


      verifyRazorpayWebhook({
        rawBody: request.rawBody,
        razorpaySignature: signature,
      })


      const event =
        request.body?.event


      // Only process captured payments.
      // Other Razorpay webhook events are acknowledged
      // without changing the Marketplace order.
      if (
        event !== 'payment.captured'
      ) {
        response.status(200).json({
          received: true,
          processed: false,
        })

        return
      }


      const paymentId =
        request.body
          ?.payload
          ?.payment
          ?.entity
          ?.id


      if (
        typeof paymentId !== 'string' ||
        paymentId.trim() === ''
      ) {
        const error = new Error(
          'Razorpay payment ID is missing from webhook.',
        )

        error.statusCode = 400

        throw error
      }


      const result =
        await processRazorpayPayment(
          paymentId.trim(),
        )


      response.status(200).json({
        received: true,
        processed: true,
        result,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// CREATE RAZORPAY PAYMENT ORDER
// =========================================================

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


// =========================================================
// VERIFY RAZORPAY PAYMENT
// =========================================================

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