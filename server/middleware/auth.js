import { findUserById } from '../modules/auth/user.repository.js'
import { verifyAuthToken } from '../modules/auth/token.service.js'
import { createHttpError } from '../utils/httpError.js'

export async function requireAuth(request, response, next) {
  try {
    const authorization = request.get('authorization') ?? ''
    const [scheme, token] = authorization.split(' ')

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw createHttpError(401, 'AUTH_REQUIRED', 'Bearer token is required')
    }

    const payload = verifyAuthToken(token)
    const user = await findUserById(payload.sub)

    if (!user) {
      throw createHttpError(401, 'USER_NOT_FOUND', 'Authenticated user no longer exists')
    }

    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export function requireRole(...allowedRoles) {
  return function authorizeRole(request, response, next) {
    if (!request.user) {
      return next(createHttpError(401, 'AUTH_REQUIRED', 'Authentication is required'))
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(createHttpError(403, 'FORBIDDEN', 'You do not have access to this route'))
    }

    return next()
  }
}
