
import {
  DEFAULT_MAINTENANCE_APPEARANCE,
  disableMaintenance,
  enableMaintenance,
  expireMaintenanceIfDue,
  getMaintenanceState,
  updateMaintenanceAppearance,
  updateMaintenanceEndAt,
  updateMaintenanceMessage,
} from './maintenance.repository.js'

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

const APPEARANCE_KEYS = Object.keys(
  DEFAULT_MAINTENANCE_APPEARANCE,
)

const EXPIRATION_CHECK_INTERVAL = 1000

export async function getMaintenanceStatus() {
  return expireMaintenanceIfDue()
}

export async function activateMaintenance() {
  return enableMaintenance()
}

export async function deactivateMaintenance() {
  return disableMaintenance()
}

export async function saveMaintenanceMessage(message) {
  return updateMaintenanceMessage(message)
}

export async function saveMaintenanceAppearance(appearance) {
  if (
    !appearance ||
    typeof appearance !== 'object' ||
    Array.isArray(appearance)
  ) {
    const error = new Error(
      'A valid maintenance appearance object is required.',
    )
    error.status = 400
    throw error
  }

  const entries = Object.entries(appearance)

  if (entries.length === 0) {
    const error = new Error(
      'Provide at least one maintenance color.',
    )
    error.status = 400
    throw error
  }

  const invalidEntry = entries.find(
    ([key, value]) =>
      !APPEARANCE_KEYS.includes(key) ||
      typeof value !== 'string' ||
      !HEX_COLOR_PATTERN.test(value),
  )

  if (invalidEntry) {
    const error = new Error(
      'Invalid maintenance color. Use supported color fields and six-digit HEX values, such as #e85d3a.',
    )
    error.status = 400
    throw error
  }

  const current = await getMaintenanceState()

  const mergedAppearance = {
    ...DEFAULT_MAINTENANCE_APPEARANCE,
    ...current.appearance,
    ...appearance,
  }

  return updateMaintenanceAppearance(mergedAppearance)
}

export async function saveMaintenanceEndTime(endAt) {
  if (endAt === null) {
    return updateMaintenanceEndAt(null)
  }

  if (typeof endAt !== 'string' || !endAt.trim()) {
    const error = new Error(
      'Provide a valid maintenance end time or null to clear it.',
    )
    error.status = 400
    throw error
  }

  const parsedEndAt = new Date(endAt)

  if (Number.isNaN(parsedEndAt.getTime())) {
    const error = new Error(
      'The maintenance end time is invalid.',
    )
    error.status = 400
    throw error
  }

  if (parsedEndAt.getTime() <= Date.now()) {
    const error = new Error(
      'The maintenance end time must be in the future.',
    )
    error.status = 400
    throw error
  }

  return updateMaintenanceEndAt(parsedEndAt)
}

// SERVER-SIDE AUTOMATIC EXPIRATION

let expirationCheckerStarted = false

async function checkScheduledExpiration() {
  try {
    await expireMaintenanceIfDue()
  } catch (error) {
    console.error(
      'Maintenance expiration check failed:',
      error.message,
    )
  }
}

export function startMaintenanceExpirationChecker() {
  if (expirationCheckerStarted) return

  expirationCheckerStarted = true

  void checkScheduledExpiration()

  const timer = setInterval(
    checkScheduledExpiration,
    EXPIRATION_CHECK_INTERVAL,
  )

  timer.unref?.()
}
