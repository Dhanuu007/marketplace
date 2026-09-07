import { getDatabase } from '../../db/mongo.js'


const COLLECTION_NAME = 'websiteContent'

const MAINTENANCE_KEY = 'maintenance'


function maintenanceCollection() {
  return getDatabase().collection(
    COLLECTION_NAME,
  )
}


let indexesReady = false


async function ensureMaintenanceIndexes() {
  if (indexesReady) {
    return
  }


  await maintenanceCollection().createIndex(
    { key: 1 },
    { unique: true },
  )


  indexesReady = true
}


// =========================================================
// GET MAINTENANCE STATE
// =========================================================

export async function getMaintenanceState() {
  await ensureMaintenanceIndexes()


  const maintenance =
    await maintenanceCollection().findOne({
      key: MAINTENANCE_KEY,
    })


  if (!maintenance) {
    return {
      enabled: false,
      message: '',
      startedAt: null,
    }
  }


  return {
    enabled:
      maintenance.enabled === true,

    message:
      maintenance.message ?? '',

    startedAt:
      maintenance.startedAt ?? null,

    updatedAt:
      maintenance.updatedAt ?? null,
  }
}


// =========================================================
// UPDATE MAINTENANCE MESSAGE
// =========================================================

export async function updateMaintenanceMessage(
  message,
) {
  await ensureMaintenanceIndexes()


  const now = new Date()


  await maintenanceCollection().updateOne(
    {
      key: MAINTENANCE_KEY,
    },

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

    {
      upsert: true,
    },
  )


  return getMaintenanceState()
}


// =========================================================
// ENABLE MAINTENANCE
// =========================================================

export async function enableMaintenance() {
  await ensureMaintenanceIndexes()


  const now = new Date()


  await maintenanceCollection().updateOne(
    {
      key: MAINTENANCE_KEY,
    },

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

    {
      upsert: true,
    },
  )


  return getMaintenanceState()
}


// =========================================================
// DISABLE MAINTENANCE
// =========================================================

export async function disableMaintenance() {
  await ensureMaintenanceIndexes()


  const now = new Date()


  await maintenanceCollection().updateOne(
    {
      key: MAINTENANCE_KEY,
    },

    {
      $set: {
        enabled: false,
        updatedAt: now,
      },

      $setOnInsert: {
        key: MAINTENANCE_KEY,
        createdAt: now,
      },
    },

    {
      upsert: true,
    },
  )


  return getMaintenanceState()
}