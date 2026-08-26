import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { createHttpError } from '../../utils/httpError.js'

export function signAuthToken(user) {
  if (!env.jwtSecret) {
    throw createHttpError(500, 'AUTH_NOT_CONFIGURED', 'JWT_SECRET is not configured')
  }

  return jwt.sign(
    {
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    {
      subject: user.id,
      expiresIn: env.jwtExpiresIn,
    },
  )
}

export function verifyAuthToken(token) {
  if (!env.jwtSecret) {
    throw createHttpError(500, 'AUTH_NOT_CONFIGURED', 'JWT_SECRET is not configured')
  }

  try {
    return jwt.verify(token, env.jwtSecret)
  } catch {
    throw createHttpError(401, 'INVALID_TOKEN', 'Token is invalid or expired')
  }
}
