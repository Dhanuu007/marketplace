import { MongoClient } from 'mongodb'
import { env } from '../config/env.js'
import { createHttpError } from '../utils/httpError.js'

let client
let database

let databaseStatus = {
  configured: Boolean(env.mongoUri),
  status: env.mongoUri ? 'disconnected' : 'not_configured',
  error: null,
}

export async function connectDatabase() {
  if (!env.mongoUri) {
    return databaseStatus
  }

  if (database) {
    return databaseStatus
  }

  try {
    client = new MongoClient(env.mongoUri, {
      serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
    })
    await client.connect()
    database = client.db(env.mongoDbName)
    databaseStatus = {
      configured: true,
      status: 'connected',
      error: null,
    }

    return databaseStatus
  } catch (error) {
    databaseStatus = {
      configured: true,
      status: 'error',
      error: error.message,
    }

    throw error
  }
}

export function getDatabase() {
  if (!database) {
    throw createHttpError(503, 'DATABASE_NOT_CONNECTED', 'MongoDB is not connected')
  }

  return database
}

export function getDatabaseStatus() {
  return databaseStatus
}

export async function checkDatabaseHealth() {
  if (!env.mongoUri) {
    return databaseStatus
  }

  try {
    await connectDatabase()
    await database.command({ ping: 1 })
    databaseStatus = {
      configured: true,
      status: 'connected',
      error: null,
    }
  } catch (error) {
    databaseStatus = {
      configured: true,
      status: 'error',
      error: error.message,
    }
  }

  return databaseStatus
}

export async function closeDatabase() {
  if (!client) return

  await client.close()
  client = undefined
  database = undefined
  databaseStatus = {
    configured: Boolean(env.mongoUri),
    status: env.mongoUri ? 'disconnected' : 'not_configured',
    error: null,
  }
}
