import { Router } from 'express'

import { env } from '../../config/env.js'

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import { createHttpError } from '../../utils/httpError.js'

import { USER_ROLES } from './auth.constants.js'

import {
  hashPassword,
  verifyPassword,
} from './password.service.js'

import { signAuthToken } from './token.service.js'

import {
  createUser,
  findUserByEmail,
  updateUserPassword,
  setUserOnline,
  setUserOffline,
} from './user.repository.js'

import {
  validateForgotPassword,
  validateLogin,
  validateRegistration,
  validateResetPassword,
} from './auth.validation.js'

import {
  createPasswordResetToken,
  deletePasswordResetToken,
  deletePasswordResetTokensForUser,
  findPasswordResetToken,
} from './passwordReset.repository.js'

import {
  sendPasswordResetEmail,
} from './mail.service.js'


const router = Router()


// =========================================================
// REGISTER
// =========================================================

router.post(
  '/auth/register',
  async (request, response, next) => {
    try {
      const input =
        validateRegistration(
          request.body,
        )

      const existingUser =
        await findUserByEmail(
          input.email,
        )

      if (existingUser) {
        throw createHttpError(
          409,
          'EMAIL_ALREADY_REGISTERED',
          'Email is already registered',
        )
      }

      const passwordHash =
        await hashPassword(
          input.password,
        )

      const user =
        await createUser({
          email: input.email,
          name: input.name,
          passwordHash,
          role: input.role,
        })

      response
        .status(201)
        .json({
          user,
          token: signAuthToken(
            user,
          ),
        })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// LOGIN
// =========================================================

router.post(
  '/auth/login',
  async (request, response, next) => {
    try {
      const input =
        validateLogin(
          request.body,
        )

      const user =
        await findUserByEmail(
          input.email,
        )

      if (!user) {
        throw createHttpError(
          401,
          'INVALID_CREDENTIALS',
          'Email or password is incorrect',
        )
      }

      const isPasswordValid =
        await verifyPassword(
          input.password,
          user.passwordHash,
        )

      if (!isPasswordValid) {
        throw createHttpError(
          401,
          'INVALID_CREDENTIALS',
          'Email or password is incorrect',
        )
      }

      // Block suspended accounts from logging in
      if (user.suspended) {
        throw createHttpError(
          403,
          'ACCOUNT_SUSPENDED',
          user.suspensionReason
            ? `Your account is suspended. Reason: ${user.suspensionReason}`
            : 'Your account has been suspended. Please contact the administrator.',
        )
      }

      delete user.passwordHash

      const token =
        signAuthToken(
          user,
        )

      // Mark user online after successful login
      const onlineUser =
        await setUserOnline(
          user.id,
        )

      response.json({
        user: onlineUser,
        token,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// FORGOT PASSWORD
// =========================================================

router.post(
  '/auth/forgot-password',
  async (request, response, next) => {
    try {
      const input =
        validateForgotPassword(
          request.body,
        )

      const user =
        await findUserByEmail(
          input.email,
        )

      /*
       * Always return the same response,
       * whether the account exists or not.
       *
       * This prevents email enumeration.
       */

      if (!user) {
        response.json({
          message:
            'If an account exists for this email, a password reset link has been sent.',
        })

        return
      }


      /*
       * Remove any previous reset tokens
       * for this account.
       */

      await deletePasswordResetTokensForUser(
        user.id,
      )


      /*
       * Reset links are valid for 30 minutes.
       */

      const expiresAt =
        new Date(
          Date.now() +
            30 * 60 * 1000,
        )


      const resetToken =
        await createPasswordResetToken({
          userId: user.id,
          expiresAt,
        })


      const resetUrl =
        `${env.clientOrigin}/reset-password?token=${encodeURIComponent(
          resetToken,
        )}`


      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
      })


      response.json({
        message:
          'If an account exists for this email, a password reset link has been sent.',
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// RESET PASSWORD
// =========================================================

router.post(
  '/auth/reset-password',
  async (request, response, next) => {
    try {
      const input =
        validateResetPassword(
          request.body,
        )

      const resetRecord =
        await findPasswordResetToken(
          input.token,
        )

      if (!resetRecord) {
        throw createHttpError(
          400,
          'INVALID_OR_EXPIRED_RESET_TOKEN',
          'This password reset link is invalid or has expired.',
        )
      }


      const passwordHash =
        await hashPassword(
          input.password,
        )


      const updatedUser =
        await updateUserPassword(
          resetRecord.userId,
          passwordHash,
        )


      if (!updatedUser) {
        throw createHttpError(
          400,
          'RESET_ACCOUNT_NOT_FOUND',
          'The account associated with this reset link could not be found.',
        )
      }


      /*
       * Make the reset link single-use.
       */

      await deletePasswordResetToken(
        input.token,
      )


      response.json({
        message:
          'Password has been reset successfully.',
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// LOGOUT
// =========================================================

router.post(
  '/auth/logout',
  requireAuth,
  async (request, response, next) => {
    try {
      // Mark user offline when they explicitly log out
      await setUserOffline(
        request.user.id,
      )

      response.json({
        status: 'ok',
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// CURRENT USER
// =========================================================

router.get(
  '/auth/me',
  requireAuth,
  (request, response) => {
    response.json({
      user: request.user,
    })
  },
)


// =========================================================
// ONLINE HEARTBEAT
// =========================================================

router.post(
  '/auth/heartbeat',
  requireAuth,
  async (request, response, next) => {
    try {
      const user =
        await setUserOnline(
          request.user.id,
        )

      response.json({
        user,
      })
    } catch (error) {
      next(error)
    }
  },
)


// =========================================================
// ADMIN CHECK
// =========================================================

router.get(
  '/auth/admin-check',
  requireAuth,
  requireRole(
    USER_ROLES.ADMIN,
  ),
  (request, response) => {
    response.json({
      status: 'ok',
      role: request.user.role,
    })
  },
)


export default router