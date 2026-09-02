import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'

let indexesReady = false

function usersCollection() {
  return getDatabase().collection('users')
}

async function ensureUsersIndexes() {
  if (indexesReady) return

  await usersCollection().createIndex(
    { email: 1 },
    { unique: true },
  )

  await usersCollection().createIndex({ role: 1 })

  indexesReady = true
}

export async function createUser({
  email,
  name,
  passwordHash,
  role,
}) {
  await ensureUsersIndexes()

  const now = new Date()

  const user = {
    email,
    name,
    passwordHash,
    role,

    // Account security
    suspended: false,
    suspensionReason: null,
    suspendedAt: null,

    // Online presence
    lastSeenAt: null,

    createdAt: now,
    updatedAt: now,
  }

  const result = await usersCollection().insertOne(user)

  return serializeUser({
    ...user,
    _id: result.insertedId,
  })
}

export async function findUserByEmail(email) {
  await ensureUsersIndexes()

  const user = await usersCollection().findOne({ email })

  return user
    ? serializeUser(user, { includePasswordHash: true })
    : null
}

export async function findUserById(id) {
  if (!ObjectId.isValid(id)) return null

  await ensureUsersIndexes()

  const user = await usersCollection().findOne({
    _id: new ObjectId(id),
  })

  return user ? serializeUser(user) : null
}

export async function findUsersByRole(role) {
  await ensureUsersIndexes()

  const users = await usersCollection()
    .find({ role })
    .sort({ name: 1 })
    .toArray()

  return users.map((user) => serializeUser(user))
}

export function serializeUser(
  user,
  { includePasswordHash = false } = {},
) {
  const serialized = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,

    // Existing users without these fields remain active
    suspended: user.suspended === true,
    suspensionReason: user.suspensionReason ?? null,
    suspendedAt: user.suspendedAt ?? null,

    // Online presence
    lastSeenAt: user.lastSeenAt ?? null,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  if (includePasswordHash) {
    serialized.passwordHash = user.passwordHash
  }

  return serialized
}

export async function updateUserPassword(
  userId,
  passwordHash,
) {
  if (!ObjectId.isValid(userId)) {
    return null
  }

  await ensureUsersIndexes()

  const result =
    await usersCollection().findOneAndUpdate(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: {
          passwordHash,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      },
    )

  return result ? serializeUser(result) : null
}

export async function setUserOnline(userId) {
  if (!ObjectId.isValid(userId)) {
    return null
  }

  await ensureUsersIndexes()

  const now = new Date()

  const result =
    await usersCollection().findOneAndUpdate(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: {
          lastSeenAt: now,
          updatedAt: now,
        },
      },
      {
        returnDocument: 'after',
      },
    )

  return result ? serializeUser(result) : null
}

export async function setUserOffline(userId) {
  if (!ObjectId.isValid(userId)) {
    return null
  }

  await ensureUsersIndexes()

  const result =
    await usersCollection().findOneAndUpdate(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: {
          lastSeenAt: null,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      },
    )

  return result ? serializeUser(result) : null
}

export async function setUserSuspended(
  userId,
  reason,
) {
  if (!ObjectId.isValid(userId)) {
    return null
  }

  await ensureUsersIndexes()

  const now = new Date()

  const result =
    await usersCollection().findOneAndUpdate(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: {
          suspended: true,
          suspensionReason: reason,
          suspendedAt: now,
          updatedAt: now,
        },
      },
      {
        returnDocument: 'after',
      },
    )

  return result ? serializeUser(result) : null
}

export async function setUserUnsuspended(userId) {
  if (!ObjectId.isValid(userId)) {
    return null
  }

  await ensureUsersIndexes()

  const result =
    await usersCollection().findOneAndUpdate(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: {
          suspended: false,
          suspensionReason: null,
          suspendedAt: null,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      },
    )

  return result ? serializeUser(result) : null
}