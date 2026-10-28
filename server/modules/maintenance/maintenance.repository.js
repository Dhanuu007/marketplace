
import { getDatabase } from '../../db/mongo.js'

const COLLECTION_NAME = 'websiteContent'
const MAINTENANCE_KEY = 'maintenance'

export const DEFAULT_MAINTENANCE_APPEARANCE = {
  background: '#1a1a1a',
  panel: '#2d2d2d',
  border: '#4a4a4a',
  accent: '#e85d3a',
  accentHighlight: '#f07b4f',
  accentDark: '#c24826',
  heading: '#f5f5f5',
  text: '#e5e5e5',
  muted: '#a3a3a3',
  buttonBackground: '#e85d3a',
  buttonText: '#ffffff',
  progressTrack: '#4a4a4a',
  progressFill: '#e85d3a',
}

function maintenanceCollection() {
  return getDatabase().collection(COLLECTION_NAME)
}

let indexesReady = false

async function ensureMaintenanceIndexes() {
  if (indexesReady) return

  await maintenanceCollection().createIndex(
    { key: 1 },
    { unique: true },
  )

  indexesReady = true
}

function serializeMaintenance(record) {
  if (!record) {
    return {
      enabled: false,
      message: '',
      startedAt: null,
      endAt: null,
      appearance: { ...DEFAULT_MAINTENANCE_APPEARANCE },
      updatedAt: null,
    }
  }

  return {
    enabled: record.enabled === true,
    message: record.message ?? '',
    startedAt: record.startedAt ?? null,
    endAt: record.endAt ?? null,
    appearance: {
      ...DEFAULT_MAINTENANCE_APPEARANCE,
      ...(record.appearance ?? {}),
    },
    updatedAt: record.updatedAt ?? null,
  }
}

// GET MAINTENANCE STATE

export async function getMaintenanceState() {
  await ensureMaintenanceIndexes()

  const record = await maintenanceCollection().findOne({
    key: MAINTENANCE_KEY,
  })

  return serializeMaintenance(record)
}

// UPDATE MAINTENANCE MESSAGE

export async function updateMaintenanceMessage(message) {
  await ensureMaintenanceIndexes()

  const now = new Date()

  await maintenanceCollection().updateOne(
    { key: MAINTENANCE_KEY },
    {
      $set: {
        message,
        updatedAt: now,
      },
      $setOnInsert: {
        key: MAINTENANCE_KEY,
        enabled: false,
        createdAt: now,
      },
    },
    { upsert: true },
  )

  return getMaintenanceState()
}

// UPDATE MAINTENANCE APPEARANCE

export async function updateMaintenanceAppearance(appearance) {
  await ensureMaintenanceIndexes()

  const now = new Date()

  await maintenanceCollection().updateOne(
    { key: MAINTENANCE_KEY },
    {
      $set: {
        appearance,
        updatedAt: now,
      },
      $setOnInsert: {
        key: MAINTENANCE_KEY,
        createdAt: now,
        enabled: false,
        message: '',
      },
    },
    { upsert: true },
  )

  return getMaintenanceState()
}

// UPDATE OR CLEAR MAINTENANCE END TIME

export async function updateMaintenanceEndAt(endAt) {
  await ensureMaintenanceIndexes()

  const now = new Date()

  const update = {
    $set: {
      updatedAt: now,
    },
    $setOnInsert: {
      key: MAINTENANCE_KEY,
      enabled: false,
      message: '',
      createdAt: now,
    },
  }

  if (endAt === null) {
    update.$unset = { endAt: '' }
  } else {
    update.$set.endAt = endAt
  }

  await maintenanceCollection().updateOne(
    { key: MAINTENANCE_KEY },
    update,
    { upsert: true },
  )

  return getMaintenanceState()
}

// DISABLE MAINTENANCE WHEN ITS DEADLINE HAS PASSED


export async function expireMaintenanceIfDue() {
  await ensureMaintenanceIndexes()

  const now = new Date()

  await maintenanceCollection().updateOne(
    {
      key: MAINTENANCE_KEY,
      enabled: true,
      endAt: {
        $type: 'date',
        $lte: now,
      },
    },
    {
      $set: {
        enabled: false,
        updatedAt: now,
      },
      $unset: {
        endAt: '',
      },
    },
  )

  return getMaintenanceState()
}

// ENABLE MAINTENANCE

export async function enableMaintenance() {
  await ensureMaintenanceIndexes()

  const now = new Date()

  await maintenanceCollection().updateOne(
    { key: MAINTENANCE_KEY },
    {
      $set: {
        enabled: true,
        startedAt: now,
        updatedAt: now,
      },
      $setOnInsert: {
        key: MAINTENANCE_KEY,
        createdAt: now,
      },
    },
    { upsert: true },
  )

  return getMaintenanceState()
}

// DISABLE MAINTENANCE MANUALLY

export async function disableMaintenance() {
  await ensureMaintenanceIndexes()

  const now = new Date()
await maintenanceCollection().updateOne(
  { key: MAINTENANCE_KEY },
  {
    $set: {
      enabled: false,
      updatedAt: now,
    },
    $unset: {
      endAt: '',
    },
    $setOnInsert: {
      key: MAINTENANCE_KEY,
      createdAt: now,
    },
  },
  { upsert: true },
)

return getMaintenanceState()
}
