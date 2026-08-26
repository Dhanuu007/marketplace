import {
  createRazorpayOrder,
  getRazorpayPayment,
} from './razorpay.js'


import {
  verifyRazorpayPayment,
} from './payment.verification.js'


import {
  getOrderById,
  getOrderByRazorpayOrderId,
  updateOrderPayment,
  updateOrderStatus,
  markOrderItemsDelivered,
} from '../../modules/order/order.repository.js'


import {
  createCreatorEarning,
} from '../../modules/earning/earnings.service.js'



export async function createPaymentOrder(
  orderId,
  userId,
) {
  const order = await getOrderById(
    orderId,
    userId,
  )


  if (!order) {
    const error = new Error(
      'Order not found.',
    )

    error.statusCode = 404

    throw error
  }


  if (
    order.status !== 'PENDING'
  ) {
    const error = new Error(
      'This order is not available for payment.',
    )

    error.statusCode = 400

    throw error
  }


  const amount = Number(
    order.totalAmount,
  )


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    const error = new Error(
      'Invalid order amount.',
    )

    error.statusCode = 400

    throw error
  }


  const razorpayOrder =
    await createRazorpayOrder({
      orderId:
        order._id.toString(),

      amount,

      currency: 'INR',
    })


  await updateOrderPayment(
    order._id.toString(),
    razorpayOrder.id,
  )


  return {
    orderId:
      order._id.toString(),

    amount:
      razorpayOrder.amount,

    currency:
      razorpayOrder.currency,

    razorpayOrderId:
      razorpayOrder.id,
  }
}



/*
 * Complete a successfully captured Marketplace
 * payment.
 *
 * This function is intentionally shared by:
 *
 * 1. Browser payment verification
 * 2. Razorpay webhook processing
 *
 * Keeping the fulfillment logic in one place
 * prevents the two payment paths from behaving
 * differently.
 */
export async function fulfillCapturedPayment({
  order,
  razorpayPayment,
}) {
  if (!order) {
    const error = new Error(
      'Marketplace order not found.',
    )

    error.statusCode = 404

    throw error
  }


  if (!razorpayPayment) {
    const error = new Error(
      'Razorpay payment could not be found.',
    )

    error.statusCode = 400

    throw error
  }


  const razorpayOrderId =
    typeof razorpayPayment.order_id === 'string'
      ? razorpayPayment.order_id.trim()
      : ''


  if (
    razorpayOrderId === ''
  ) {
    const error = new Error(
      'Razorpay payment is not linked to a Razorpay order.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Confirm that the payment belongs to the
   * Razorpay order stored on the Marketplace
   * order.
   */
  if (
    typeof order.razorpayOrderId !== 'string' ||
    order.razorpayOrderId.trim() === ''
  ) {
    const error = new Error(
      'Razorpay order is not linked to this Marketplace order.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    order.razorpayOrderId.trim() !==
    razorpayOrderId
  ) {
    const error = new Error(
      'Razorpay payment does not belong to the expected Marketplace order.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Only captured payments may fulfill a
   * Marketplace order.
   */
  if (
    razorpayPayment.status !==
    'captured'
  ) {
    const error = new Error(
      `Razorpay payment is not captured. Current status: ${razorpayPayment.status || 'unknown'}.`,
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Marketplace amounts are stored in INR.
   *
   * Razorpay amounts are returned in paise.
   */
  const marketplaceAmountInPaise =
    Math.round(
      Number(order.totalAmount) * 100,
    )


  const razorpayAmountInPaise =
    Number(
      razorpayPayment.amount,
    )


  if (
    !Number.isFinite(
      marketplaceAmountInPaise,
    ) ||
    marketplaceAmountInPaise <= 0
  ) {
    const error = new Error(
      'Invalid Marketplace order amount.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    !Number.isFinite(
      razorpayAmountInPaise,
    ) ||
    razorpayAmountInPaise <= 0
  ) {
    const error = new Error(
      'Invalid Razorpay payment amount.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Never fulfill an order when the amount
   * actually captured by Razorpay differs
   * from the Marketplace order total.
   */
  if (
    razorpayAmountInPaise !==
    marketplaceAmountInPaise
  ) {
    const error = new Error(
      'Razorpay payment amount does not match the Marketplace order amount.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Confirm the currency.
   */
  if (
    String(
      razorpayPayment.currency ||
      '',
    ).toUpperCase() !== 'INR'
  ) {
    const error = new Error(
      'Razorpay payment currency does not match the Marketplace currency.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * If the Marketplace order is already PAID,
   * the payment has already been fulfilled.
   *
   * This makes browser verification and webhook
   * delivery idempotent.
   */
  if (
    order.status === 'PAID'
  ) {
    return {
      order,
      alreadyProcessed: true,
    }
  }


  /*
   * Only PENDING Marketplace orders may move
   * into PAID through this payment flow.
   */
  if (
    order.status !== 'PENDING'
  ) {
    const error = new Error(
      `Marketplace order cannot be paid from status: ${order.status}.`,
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Mark Marketplace order as PAID.
   */
  const updatedOrder =
    await updateOrderStatus(
      order._id.toString(),
      'PAID',
    )


  if (!updatedOrder) {
    const error = new Error(
      'Payment was verified, but the Marketplace order could not be updated.',
    )

    error.statusCode = 500

    throw error
  }


  /*
   * Create Creator earnings.
   *
   * The configured commission percentage comes
   * from Website Settings.
   *
   * Default = 5%.
   *
   * Admin may change the configured percentage.
   */
  for (
    const item of
      updatedOrder.items ?? []
  ) {
    if (
      typeof item.creatorId !== 'string' ||
      item.creatorId.trim() === ''
    ) {
      continue
    }


    const grossAmount =
      Number(item.itemTotal)


    if (
      !Number.isFinite(grossAmount) ||
      grossAmount <= 0
    ) {
      continue
    }


    await createCreatorEarning({
      orderId:
        updatedOrder._id.toString(),

      productId:
        item.productId,

      creatorId:
        item.creatorId,

      creatorName:
        item.creatorName ?? '',

      grossAmount,
    })
  }


  /*
   * Activate automatic Marketplace website
   * delivery.
   *
   * The exact website ZIP was already snapshotted
   * into the order item when the order was created.
   */
  const deliveredOrder =
    await markOrderItemsDelivered(
      updatedOrder._id.toString(),
    )


  if (!deliveredOrder) {
    const error = new Error(
      'Payment was verified, but website delivery could not be activated.',
    )

    error.statusCode = 500

    throw error
  }


  return {
    order:
      deliveredOrder,

    alreadyProcessed: false,
  }
}



/*
 * Browser-side payment verification.
 *
 * This is called after Razorpay Checkout returns
 * the payment response to the Buyer browser.
 */
export async function verifyPayment(
  orderId,
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) {
  const order = await getOrderById(
    orderId,
    userId,
  )


  if (!order) {
    const error = new Error(
      'Order not found.',
    )

    error.statusCode = 404

    throw error
  }


  /*
   * If the order is already PAID, return success
   * instead of trying to process it again.
   */
  if (
    order.status === 'PAID'
  ) {
    return {
      orderId:
        order._id.toString(),

      verified: true,

      status: 'PAID',

      razorpayOrderId:
        typeof order.razorpayOrderId === 'string'
          ? order.razorpayOrderId
          : razorpayOrderId.trim(),

      razorpayPaymentId:
        razorpayPaymentId.trim(),
    }
  }


  if (
    order.status !== 'PENDING'
  ) {
    const error = new Error(
      'This order is not available for payment verification.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    typeof order.razorpayOrderId !== 'string' ||
    order.razorpayOrderId.trim() === ''
  ) {
    const error = new Error(
      'Razorpay order is not linked to this Marketplace order.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Make sure the Razorpay Order ID returned
   * by Checkout belongs to this Marketplace order.
   */
  if (
    order.razorpayOrderId.trim() !==
    razorpayOrderId.trim()
  ) {
    const error = new Error(
      'Razorpay order does not match the Marketplace order.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Verify Razorpay's cryptographic signature.
   */
  verifyRazorpayPayment({
    razorpayOrderId,

    razorpayPaymentId,

    razorpaySignature,
  })


  /*
   * Fetch the actual payment directly from
   * Razorpay's server-side API.
   */
  let razorpayPayment

  try {
    razorpayPayment =
      await getRazorpayPayment(
        razorpayPaymentId,
      )
  } catch (error) {
    const paymentError =
      new Error(
        'Unable to verify the Razorpay payment status.',
      )

    paymentError.statusCode = 502

    paymentError.cause = error

    throw paymentError
  }


  const result =
    await fulfillCapturedPayment({
      order,

      razorpayPayment,
    })


  return {
    orderId:
      result.order._id.toString(),

    verified: true,

    status: 'PAID',

    razorpayOrderId:
      razorpayOrderId.trim(),

    razorpayPaymentId:
      razorpayPaymentId.trim(),
  }
}



/*
 * Server-side payment processing used by
 * Razorpay webhook events.
 *
 * No Marketplace authentication is required
 * because Razorpay calls this endpoint directly.
 */
export async function processRazorpayPayment(
  razorpayPaymentId,
) {
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


  let razorpayPayment

  try {
    razorpayPayment =
      await getRazorpayPayment(
        razorpayPaymentId,
      )
  } catch (error) {
    const paymentError =
      new Error(
        'Unable to retrieve the Razorpay payment.',
      )

    paymentError.statusCode = 502

    paymentError.cause = error

    throw paymentError
  }


  if (!razorpayPayment) {
    const error = new Error(
      'Razorpay payment could not be found.',
    )

    error.statusCode = 404

    throw error
  }


  if (
    razorpayPayment.status !==
    'captured'
  ) {
    return {
      processed: false,

      status:
        razorpayPayment.status ||
        'unknown',

      message:
        'Payment has not been captured.',
    }
  }


  const razorpayOrderId =
    typeof razorpayPayment.order_id === 'string'
      ? razorpayPayment.order_id.trim()
      : ''


  if (
    razorpayOrderId === ''
  ) {
    const error = new Error(
      'Captured Razorpay payment has no order ID.',
    )

    error.statusCode = 400

    throw error
  }


  const order =
    await getOrderByRazorpayOrderId(
      razorpayOrderId,
    )


  if (!order) {
    const error = new Error(
      'Marketplace order for the Razorpay order was not found.',
    )

    error.statusCode = 404

    throw error
  }


  const result =
    await fulfillCapturedPayment({
      order,

      razorpayPayment,
    })


  return {
    processed: true,

    alreadyProcessed:
      result.alreadyProcessed,

    status: 'PAID',

    orderId:
      result.order._id.toString(),

    razorpayOrderId,

    razorpayPaymentId:
      razorpayPaymentId.trim(),
  }
}