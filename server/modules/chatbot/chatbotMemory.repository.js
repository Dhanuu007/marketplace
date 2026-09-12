import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'


const COLLECTION_NAME = 'aiMemories'


function memoriesCollection() {
  return getDatabase().collection(
    COLLECTION_NAME,
  )
}


let indexesReady = false


async function ensureMemoryIndexes() {
  if (indexesReady) {
    return
  }


  await memoriesCollection().createIndex(
    {
      userId: 1,
      key: 1,
    },
    {
      unique: true,
    },
  )


  indexesReady = true
}


// =========================================================
// GET USER MEMORIES
// =========================================================

export async function getUserMemories(
  userId,
) {
  if (!ObjectId.isValid(userId)) {
    return []
  }


  await ensureMemoryIndexes()


  const memories =
    await memoriesCollection()
      .find({
        userId: new ObjectId(userId),
      })
      .sort({
        updatedAt: -1,
      })
      .toArray()


  return memories.map(
    (memory) => ({
      id: memory._id.toString(),
      key: memory.key,
      value: memory.value,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
    }),
  )
}


// =========================================================
// SAVE USER MEMORY
// =========================================================

export async function saveUserMemory({
  userId,
  key,
  value,
}) {
  if (!ObjectId.isValid(userId)) {
    return null
  }


  await ensureMemoryIndexes()


  const now = new Date()


  const result =
    await memoriesCollection().findOneAndUpdate(
      {
        userId: new ObjectId(userId),
        key,
      },

      {
        $set: {
          value,
          updatedAt: now,
        },

        $setOnInsert: {
          userId: new ObjectId(userId),
          key,
          createdAt: now,
        },
      },

      {
        upsert: true,
        returnDocument: 'after',
      },
    )


  if (!result) {
    return null
  }


  return {
    id: result._id.toString(),
    key: result.key,
    value: result.value,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  }
}


// =========================================================
// DELETE USER MEMORY
// =========================================================

export async function deleteUserMemory({
  userId,
  key,
}) {
  if (!ObjectId.isValid(userId)) {
    return false
  }


  await ensureMemoryIndexes()


  const result =
    await memoriesCollection().deleteOne({
      userId: new ObjectId(userId),
      key,
    })


  return result.deletedCount > 0
}