import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


/*
 * Load the project-level environment first.
 * This contains the existing MongoDB and application
 * environment variables.
 */
dotenv.config({
  path: path.resolve(
    __dirname,
    '../../.env',
  ),
})


/*
 * Load backend-specific environment variables.
 * This contains backend-only values such as
 * Razorpay credentials.
 */
dotenv.config({
  path: path.resolve(
    __dirname,
    '../.env',
  ),
})


const DEFAULT_PORT = 4000
const DEFAULT_CLIENT_ORIGIN = 'http://localhost:5173'
const DEFAULT_DB_NAME = 'market_palce'
const DEFAULT_MONGO_TIMEOUT_MS = 5000


function readNumber(name, fallback) {
  const value = process.env[name]

  if (!value) return fallback

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return parsed
}


export const env = {
  nodeEnv:
    process.env.NODE_ENV ??
    'development',

  port:
    readNumber(
      'PORT',
      DEFAULT_PORT,
    ),

  clientOrigin:
    process.env.CLIENT_ORIGIN ??
    DEFAULT_CLIENT_ORIGIN,

  mongoUri:
    process.env.MONGODB_URI ??
    '',

  mongoDbName:
    process.env.MONGODB_DB_NAME ??
    DEFAULT_DB_NAME,

  mongoServerSelectionTimeoutMs:
    readNumber(
      'MONGODB_SERVER_SELECTION_TIMEOUT_MS',
      DEFAULT_MONGO_TIMEOUT_MS,
    ),

  jwtSecret:
    process.env.JWT_SECRET ??
    '',

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN ??
    '1d',

  resendApiKey:
    process.env.RESEND_API_KEY ??
    '',

  mailFrom:
    process.env.MAIL_FROM ??
    '',

  razorpayKeyId:
    process.env.RAZORPAY_KEY_ID ??
    '',

  razorpayKeySecret:
    process.env.RAZORPAY_KEY_SECRET ??
    '',
}


export function validateProductionEnv() {
  if (env.nodeEnv !== 'production') return

  const missing = []

  if (!env.mongoUri) {
    missing.push('MONGODB_URI')
  }

  if (!env.jwtSecret) {
    missing.push('JWT_SECRET')
  }

  if (!env.razorpayKeyId) {
    missing.push('RAZORPAY_KEY_ID')
  }

  if (!env.razorpayKeySecret) {
    missing.push('RAZORPAY_KEY_SECRET')
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing production environment variables: ${missing.join(', ')}`,
    )
  }
}