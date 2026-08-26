import { PUBLIC_REGISTRATION_ROLES, USER_ROLES } from './auth.constants.js'
import { createHttpError } from '../../utils/httpError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegistration(body) {
  const email = normalizeEmail(body.email)
  const name = normalizeName(body.name)
  const password = readPassword(body.password)
  const role = body.role ?? USER_ROLES.BUYER

  if (!name) {
    throw createHttpError(400, 'INVALID_NAME', 'Name is required')
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw createHttpError(400, 'INVALID_EMAIL', 'A valid email is required')
  }

  if (password.length < 8) {
    throw createHttpError(400, 'INVALID_PASSWORD', 'Password must be at least 8 characters')
  }

  if (!PUBLIC_REGISTRATION_ROLES.includes(role)) {
    throw createHttpError(400, 'INVALID_ROLE', 'Registration supports BUYER or CREATOR roles')
  }

  return {
    email,
    name,
    password,
    role,
  }
}

export function validateLogin(body) {
  const email = normalizeEmail(body.email)
  const password = readPassword(body.password)

  if (!EMAIL_PATTERN.test(email) || !password) {
    throw createHttpError(400, 'INVALID_CREDENTIALS', 'Email and password are required')
  }

  return {
    email,
    password,
  }
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

function normalizeName(name) {
  return String(name ?? '').trim()
}

function readPassword(password) {
  return String(password ?? '')
}

export function validateForgotPassword(body) {
  const email = normalizeEmail(body.email)

  if (!EMAIL_PATTERN.test(email)) {
    throw createHttpError(
      400,
      'INVALID_EMAIL',
      'A valid email is required',
    )
  }

  return {
    email,
  }
}


export function validateResetPassword(body) {
  const token =
    String(body.token ?? '').trim()

  const password =
    readPassword(body.password)

  if (!token) {
    throw createHttpError(
      400,
      'INVALID_RESET_TOKEN',
      'Reset token is required',
    )
  }

  if (password.length < 8) {
    throw createHttpError(
      400,
      'INVALID_PASSWORD',
      'Password must be at least 8 characters',
    )
  }

  return {
    token,
    password,
  }
}