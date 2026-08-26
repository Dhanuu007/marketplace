import { getDatabase } from '../db/mongo.js'



const COLLECTION_NAME = 'creatorPaymentProfiles'



function paymentProfilesCollection() {
  return getDatabase().collection(
    COLLECTION_NAME,
  )
}



let indexesReady = false



async function ensurePaymentProfileIndexes() {
  if (indexesReady) return


  await paymentProfilesCollection().createIndex(
    { creatorId: 1 },
    { unique: true },
  )


  await paymentProfilesCollection().createIndex({
    createdAt: -1,
  })


  indexesReady = true
}



export async function getPaymentProfileByCreatorId(
  creatorId,
) {
  await ensurePaymentProfileIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    return null
  }


  return paymentProfilesCollection().findOne({
    creatorId: creatorId.trim(),
  })
}



export async function createPaymentProfile({
  creatorId,
  accountHolderName,
  bankName,
  accountNumber,
  ifscCode,
  upiId,
}) {
  await ensurePaymentProfileIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    throw new Error(
      'Creator ID is required.',
    )
  }


  const now = new Date()


  const document = {
    creatorId: creatorId.trim(),

    accountHolderName:
      typeof accountHolderName === 'string'
        ? accountHolderName.trim()
        : '',

    bankName:
      typeof bankName === 'string'
        ? bankName.trim()
        : '',

    accountNumber:
      typeof accountNumber === 'string'
        ? accountNumber.trim()
        : '',

    ifscCode:
      typeof ifscCode === 'string'
        ? ifscCode.trim().toUpperCase()
        : '',

    upiId:
      typeof upiId === 'string'
        ? upiId.trim()
        : '',

    createdAt: now,
    updatedAt: now,
  }


  const result =
    await paymentProfilesCollection().insertOne(
      document,
    )


  return paymentProfilesCollection().findOne({
    _id: result.insertedId,
  })
}



export async function updatePaymentProfile(
  creatorId,
  {
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    upiId,
  },
) {
  await ensurePaymentProfileIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    throw new Error(
      'Creator ID is required.',
    )
  }


  const update = {
    updatedAt: new Date(),
  }


  if (
    typeof accountHolderName === 'string'
  ) {
    update.accountHolderName =
      accountHolderName.trim()
  }


  if (typeof bankName === 'string') {
    update.bankName = bankName.trim()
  }


  if (typeof accountNumber === 'string') {
    update.accountNumber =
      accountNumber.trim()
  }


  if (typeof ifscCode === 'string') {
    update.ifscCode =
      ifscCode.trim().toUpperCase()
  }


  if (typeof upiId === 'string') {
    update.upiId = upiId.trim()
  }


  return paymentProfilesCollection().findOneAndUpdate(
    {
      creatorId: creatorId.trim(),
    },
    {
      $set: update,
    },
    {
      returnDocument: 'after',
    },
  )
}



export async function deletePaymentProfile(
  creatorId,
) {
  await ensurePaymentProfileIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    return null
  }


  return paymentProfilesCollection().findOneAndDelete(
    {
      creatorId: creatorId.trim(),
    },
  )
}