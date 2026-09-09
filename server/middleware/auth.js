import { findUserById } from '../modules/auth/user.repository.js'
import { getMaintenanceState } from '../modules/maintenance/maintenance.repository.js'
import { verifyAuthToken } from '../modules/auth/token.service.js'
import { createHttpError } from '../utils/httpError.js'

export async function requireAuth(request, response, next) {
  try {
    const authorization = request.get('authorization') ?? ''
    const [scheme, token] = authorization.split(' ')

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw createHttpError(
        401,
        'AUTH_REQUIRED',
        'Bearer token is required',
      )
    }

    const payload = verifyAuthToken(token)

    const user = await findUserById(payload.sub)

    if (!user) {
      throw createHttpError(
        401,
        'USER_NOT_FOUND',
        'Authenticated user no longer exists',
      )
    }

    if (user.suspended) {
      throw createHttpError(
        403,
        'ACCOUNT_SUSPENDED',
        user.suspensionReason
          ? `Your account is suspended. Reason: ${user.suspensionReason}`
          : 'Your account has been suspended. Please contact the administrator.',
      )
    }

    /*
     * Maintenance protection
     *
     * Admin accounts remain usable so the administrator
     * can control and disable maintenance mode.
     *
     * Buyer and Creator accounts are blocked while
     * maintenance is active.
     *
     * Their tokens are also invalidated permanently
     * after maintenance is disabled if those tokens
     * were issued before the maintenance started.
     */
    if (user.role !== 'ADMIN') {
      const maintenance = await getMaintenanceState()

      if (maintenance.enabled) {
        throw createHttpError(
          503,
          'MAINTENANCE_MODE',
          'Marketplace is currently under maintenance. Please try again later.',
        )
      }

      if (maintenance.startedAt && payload.iat) {
        const maintenanceStartedAt =
          new Date(maintenance.startedAt).getTime()

        const tokenIssuedAt = payload.iat * 1000

        if (tokenIssuedAt <= maintenanceStartedAt) {
          throw createHttpError(
            401,
            'SESSION_INVALIDATED_BY_MAINTENANCE',
            'Your session was ended because the marketplace entered maintenance mode. Please log in again.',
          )
        }
      }
    }

    request.user = user

    next()
  } catch (error) {
    next(error)
  }
}


export async function optionalAuth(request, response, next) {
  try {
    const authorization =
      request.get('authorization') ?? ''

    /*
     * No Authorization header means the visitor
     * is simply browsing as a guest.
     */
    if (!authorization) {
      return next()
    }

    const [scheme, token] =
      authorization.split(' ')

    /*
     * If an Authorization header was supplied,
     * it must be a valid Bearer token.
     */
    if (
      scheme?.toLowerCase() !== 'bearer' ||
      !token
    ) {
      throw createHttpError(
        401,
        'INVALID_AUTH',
        'Invalid authorization header',
      )
    }

    const payload =
      verifyAuthToken(token)

    const user =
      await findUserById(payload.sub)

    if (!user) {
      throw createHttpError(
        401,
        'USER_NOT_FOUND',
        'Authenticated user no longer exists',
      )
    }

    if (user.suspended) {
      throw createHttpError(
        403,
        'ACCOUNT_SUSPENDED',
        user.suspensionReason
          ? `Your account is suspended. Reason: ${user.suspensionReason}`
          : 'Your account has been suspended. Please contact the administrator.',
      )
    }

    /*
     * Keep the same maintenance/session rules
     * used by requireAuth().
     *
     * Admin accounts remain usable.
     */
    if (user.role !== 'ADMIN') {
      const maintenance =
        await getMaintenanceState()

      if (maintenance.enabled) {
        throw createHttpError(
          503,
          'MAINTENANCE_MODE',
          'Marketplace is currently under maintenance. Please try again later.',
        )
      }

      if (
        maintenance.startedAt &&
        payload.iat
      ) {
        const maintenanceStartedAt =
          new Date(
            maintenance.startedAt,
          ).getTime()

        const tokenIssuedAt =
          payload.iat * 1000

        if (
          tokenIssuedAt <=
          maintenanceStartedAt
        ) {
          throw createHttpError(
            401,
            'SESSION_INVALIDATED_BY_MAINTENANCE',
            'Your session was ended because the marketplace entered maintenance mode. Please log in again.',
          )
        }
      }
    }

    request.user = user

    return next()
  } catch (error) {
    return next(error)
  }
}

export async function requireSuspensionSupportAuth(
  request,
  response,
  next,
) {
  try {
    const authorization = request.get('authorization') ?? ''
    const [scheme, token] = authorization.split(' ')

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw createHttpError(
        401,
        'AUTH_REQUIRED',
        'Bearer token is required',
      )
    }

    const payload = verifyAuthToken(token)

    const user = await findUserById(payload.sub)

    if (!user) {
      throw createHttpError(
        401,
        'USER_NOT_FOUND',
        'Authenticated user no longer exists',
      )
    }

    if (user.role !== 'BUYER' && user.role !== 'CREATOR') {
      throw createHttpError(
        403,
        'FORBIDDEN',
        'Only Buyer and Creator accounts can use suspension support',
      )
    }

    if (!user.suspended) {
      throw createHttpError(
        403,
        'SUSPENSION_SUPPORT_REQUIRED',
        'Suspension support is available only for suspended accounts',
      )
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
      return next(
        createHttpError(
          401,
          'AUTH_REQUIRED',
          'Authentication is required',
        ),
      )
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(
        createHttpError(
          403,
          'FORBIDDEN',
          'You do not have access to this route',
        ),
      )
    }

    return next()
  }
}