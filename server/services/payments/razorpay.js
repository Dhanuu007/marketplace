import Razorpay from 'razorpay'


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})


export async function createRazorpayOrder({
  orderId,
  amount,
  currency = 'INR',
}) {
  const razorpayOrder =
    await razorpay.orders.create({
      amount: Math.round(
        Number(amount) * 100,
      ),

      currency,

      receipt: orderId,
    })


  return razorpayOrder
}


/*
 * Fetch a Razorpay payment directly from
 * Razorpay's server-side API.
 *
 * This is used after Checkout signature
 * verification to confirm the actual payment
 * status and amount.
 */
export async function getRazorpayPayment(
  paymentId,
) {
  if (
    typeof paymentId !== 'string' ||
    paymentId.trim() === ''
  ) {
    const error = new Error(
      'Razorpay payment ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  return razorpay.payments.fetch(
    paymentId.trim(),
  )
}