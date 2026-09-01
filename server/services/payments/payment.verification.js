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

export function verifyRazorpayWebhook({
  rawBody,
  razorpaySignature,
}) {
  if (
    !Buffer.isBuffer(rawBody) ||
    rawBody.length === 0
  ) {
    const error = new Error(
      'Razorpay webhook raw body is required.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    typeof razorpaySignature !== 'string' ||
    razorpaySignature.trim() === ''
  ) {
    const error = new Error(
      'Razorpay webhook signature is required.',
    )

    error.statusCode = 400

    throw error
  }


  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET


  if (
    typeof webhookSecret !== 'string' ||
    webhookSecret.trim() === ''
  ) {
    const error = new Error(
      'Razorpay webhook secret is not configured.',
    )

    error.statusCode = 500

    throw error
  }


  const generatedSignature =
    crypto
      .createHmac(
        'sha256',
        webhookSecret.trim(),
      )
      .update(rawBody)
      .digest('hex')


  const receivedSignature =
    razorpaySignature.trim()


  const generatedBuffer =
    Buffer.from(
      generatedSignature,
      'utf8',
    )

  const receivedBuffer =
    Buffer.from(
      receivedSignature,
      'utf8',
    )


  if (
    generatedBuffer.length !==
    receivedBuffer.length ||
    !crypto.timingSafeEqual(
      generatedBuffer,
      receivedBuffer,
    )
  ) {
    const error = new Error(
      'Razorpay webhook signature verification failed.',
    )

    error.statusCode = 400

    throw error
  }


  return true
}