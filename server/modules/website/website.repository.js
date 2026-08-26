import { getDatabase } from '../../db/mongo.js'

const COLLECTION_NAME = 'websiteContent'

function websiteCollection() {
  return getDatabase().collection(COLLECTION_NAME)
}

let indexesReady = false

async function ensureWebsiteIndexes() {
  if (indexesReady) return

  await websiteCollection().createIndex(
    { key: 1 },
    { unique: true },
  )

  indexesReady = true
}


// =========================
// HOMEPAGE
// =========================

export async function getHomepage() {
  await ensureWebsiteIndexes()

  return websiteCollection().findOne({
    key: 'homepage',
  })
}

export async function saveHomepage(homepage) {
  await ensureWebsiteIndexes()

  const now = new Date()

  const existing = await websiteCollection().findOne({
    key: 'homepage',
  })

  if (existing) {
    await websiteCollection().updateOne(
      { key: 'homepage' },
      {
        $set: {
          ...homepage,
          updatedAt: now,
        },
      },
    )

    return websiteCollection().findOne({
      key: 'homepage',
    })
  }

  const document = {
    key: 'homepage',
    ...homepage,
    createdAt: now,
    updatedAt: now,
  }

  const result = await websiteCollection().insertOne(document)

  return websiteCollection().findOne({
    _id: result.insertedId,
  })
}


// =========================
// WEBSITE SETTINGS
// =========================

export async function getWebsiteSettings() {
  await ensureWebsiteIndexes()

  return websiteCollection().findOne({
    key: 'settings',
  })
}

export async function saveWebsiteSettings(settings) {
  await ensureWebsiteIndexes()

  const now = new Date()

  const existing = await websiteCollection().findOne({
    key: 'settings',
  })

  if (existing) {
    await websiteCollection().updateOne(
      { key: 'settings' },
      {
        $set: {
          ...settings,
          updatedAt: now,
        },
      },
    )

    return websiteCollection().findOne({
      key: 'settings',
    })
  }

  const document = {
    key: 'settings',
    ...settings,
    createdAt: now,
    updatedAt: now,
  }

  const result = await websiteCollection().insertOne(document)

  return websiteCollection().findOne({
    _id: result.insertedId,
  })
}