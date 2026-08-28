function requireString(value, fieldName) {
  if (
    typeof value !== 'string' ||
    value.trim() === ''
  ) {
    const error = new Error(
      `${fieldName} is required.`,
    )

    error.statusCode = 400

    throw error
  }

  return value.trim()
}


export function validateCreateConversation(input) {
  const orderId = requireString(
    input?.orderId,
    'Order ID',
  )

  const productId = requireString(
    input?.productId,
    'Product ID',
  )

  return {
    orderId,
    productId,
  }
}


export function validateSendMessage(input) {
  const text = requireString(
    input?.text,
    'Message',
  )

  if (text.length > 2000) {
    const error = new Error(
      'Message cannot exceed 2000 characters.',
    )

    error.statusCode = 400

    throw error
  }

  return {
    text,
  }
}