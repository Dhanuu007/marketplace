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


export function validateChatbotMessage(input) {
  const message =
    requireString(
      input?.message,
      'Message',
    )


  if (message.length > 2000) {
    const error = new Error(
      'Message cannot exceed 2000 characters.',
    )

    error.statusCode = 400

    throw error
  }


  return {
    message,
  }
}