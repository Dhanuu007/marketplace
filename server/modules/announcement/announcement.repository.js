
import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'

const COLLECTION_NAME = 'announcements'

function announcementCollection() {
  return getDatabase().collection(COLLECTION_NAME)
}

let indexesReady = false

async function ensureAnnouncementIndexes() {
  if (indexesReady) return

  await announcementCollection().createIndex({
    createdAt: -1,
  })

  await announcementCollection().createIndex({
    status: 1,
    createdAt: -1,
  })

  indexesReady = true
}

/*
 * CREATE ANNOUNCEMENT
 */
export async function createAnnouncement({
  title,
  message,
  adminId,
}) {
  await ensureAnnouncementIndexes()

  const now = new Date()

  const document = {
    title,
    message,
    adminId,
    status: 'PUBLISHED',
    audience: ['BUYER', 'CREATOR'],
    createdAt: now,
    updatedAt: now,
  }

  const result = await announcementCollection().insertOne(
    document,
  )

  return announcementCollection().findOne({
    _id: result.insertedId,
  })
}

/*
 * GET ALL ANNOUNCEMENTS FOR ADMIN
 * Excludes soft-deleted announcements.
 */
export async function getAllAnnouncements() {
  await ensureAnnouncementIndexes()

  return announcementCollection()
    .find({
      status: { $ne: 'DELETED' },
    })
    .sort({ createdAt: -1 })
    .toArray()
}

/*
 * GET ONE ANNOUNCEMENT
 */
export async function getAnnouncementById(id) {
  await ensureAnnouncementIndexes()

  if (!ObjectId.isValid(id)) {
    return null
  }

  return announcementCollection().findOne({
    _id: new ObjectId(id),
  })
}

/*
 * UPDATE ANNOUNCEMENT
 */
export async function updateAnnouncement(
  id,
  { title, message },
) {
  await ensureAnnouncementIndexes()

  if (!ObjectId.isValid(id)) {
    return null
  }

  return announcementCollection().findOneAndUpdate(
    {
      _id: new ObjectId(id),
      status: { $ne: 'DELETED' },
    },
    {
      $set: {
        title,
        message,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
    },
  )
}

/*
 * SOFT DELETE ANNOUNCEMENT
 */
export async function deleteAnnouncement(id) {
  await ensureAnnouncementIndexes()

  if (!ObjectId.isValid(id)) {
    return false
  }

  const now = new Date()

  const result = await announcementCollection().updateOne(
    {
      _id: new ObjectId(id),
      status: 'PUBLISHED',
    },
    {
      $set: {
        status: 'DELETED',
        deletedAt: now,
        updatedAt: now,
      },
    },
  )

  return result.modifiedCount > 0
}

/*
 * GET PUBLISHED ANNOUNCEMENTS
 */
export async function getPublishedAnnouncements() {
  await ensureAnnouncementIndexes()

  return announcementCollection()
    .find({
      status: 'PUBLISHED',
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()
}
