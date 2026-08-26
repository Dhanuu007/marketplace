import crypto from 'crypto'

import { getDatabase } from '../../db/mongo.js'


const COLLECTION_NAME =
  'passwordResetTokens'


function resetTokensCollection() {
  return getDatabase().collection(
    COLLECTION_NAME,
  )
}


let indexesReady = false


async function ensureResetTokenIndexes() {
  if (indexesReady) return

  await resetTokensCollection().createIndex(
    { tokenHash: 1 },
    { unique: true },
  )

  await resetTokensCollection().createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 },
  )

  indexesReady = true
}


export async function createPasswordResetToken({
  userId,
  expiresAt,
}) {
  await ensureResetTokenIndexes()

  const token =
    crypto.randomBytes(32).toString('hex')

  const tokenHash =
    crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')


  await resetTokensCollection().insertOne({
    userId,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  })


  return token
}


export async function findPasswordResetToken(
  token,
) {
  await ensureResetTokenIndexes()

  const tokenHash =
    crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')


  return resetTokensCollection().findOne({
    tokenHash,
    expiresAt: {
      $gt: new Date(),
    },
  })
}


export async function deletePasswordResetToken(
  token,
) {
  await ensureResetTokenIndexes()

  const tokenHash =
    crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')


  await resetTokensCollection().deleteOne({
    tokenHash,
  })
}


export async function deletePasswordResetTokensForUser(
  userId,
) {
  await ensureResetTokenIndexes()

  await resetTokensCollection().deleteMany({
    userId,
  })
}