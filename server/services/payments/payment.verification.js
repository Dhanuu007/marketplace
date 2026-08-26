import crypto from 'crypto'


export function verifyRazorpayPayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
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


  const keySecret =
    process.env.RAZORPAY_KEY_SECRET


  if (
    typeof keySecret !== 'string' ||
    keySecret.trim() === ''
  ) {
    const error = new Error(
      'Razorpay key secret is not configured.',
    )

    error.statusCode = 500

    throw error
  }


  const generatedSignature =
    crypto
      .createHmac(
        'sha256',
        keySecret,
      )
      .update(
        `${razorpayOrderId.trim()}|${razorpayPaymentId.trim()}`,
      )
      .digest('hex')


  const signaturesMatch =
    generatedSignature ===
    razorpaySignature.trim()


  if (!signaturesMatch) {
    const error = new Error(
      'Razorpay payment signature verification failed.',
    )

    error.statusCode = 400

    throw error
  }


  return true
}