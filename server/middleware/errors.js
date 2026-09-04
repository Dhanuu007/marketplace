export function notFoundHandler(request, response) {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `No route found for ${request.method} ${request.originalUrl}`,
    },
  })
}


export function errorHandler(
  error,
  request,
  response,
  next,
) {
  console.error(
    '[ERROR]',
    request.method,
    request.originalUrl,
    error,
  )

  if (response.headersSent) {
    return next(error)
  }

  const statusCode =
    error.statusCode ?? 500

  const message =
    statusCode === 500
      ? 'Internal server error'
      : error.message

  return response.status(statusCode).json({
    error: {
      code:
        error.code ??
        'INTERNAL_ERROR',
      message,
    },
  })
}