import { getDatabase } from '../../db/mongo.js'


const COLLECTION_NAME =
  'creatorRouteAccounts'


function routeAccountsCollection() {
  return getDatabase().collection(
    COLLECTION_NAME,
  )
}


let indexesReady = false


async function ensureRouteAccountIndexes() {
  if (indexesReady) return


  await routeAccountsCollection().createIndex(
    { creatorId: 1 },
    { unique: true },
  )


  await routeAccountsCollection().createIndex(
    { razorpayAccountId: 1 },
    { unique: true },
  )


  await routeAccountsCollection().createIndex({
    onboardingStatus: 1,
    updatedAt: -1,
  })


  indexesReady = true
}


/*
 * Get the Razorpay Route account for a Creator.
 */
export async function getRouteAccountByCreatorId(
  creatorId,
) {
  await ensureRouteAccountIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    return null
  }


  return routeAccountsCollection().findOne({
    creatorId: creatorId.trim(),
  })
}


/*
 * Get a Route account using the Razorpay
 * Linked Account ID.
 */
export async function getRouteAccountByRazorpayAccountId(
  razorpayAccountId,
) {
  await ensureRouteAccountIndexes()


  if (
    typeof razorpayAccountId !== 'string' ||
    razorpayAccountId.trim() === ''
  ) {
    return null
  }


  return routeAccountsCollection().findOne({
    razorpayAccountId:
      razorpayAccountId.trim(),
  })
}


/*
 * Create a Creator → Razorpay Linked Account
 * mapping.
 *
 * This also initializes the Route onboarding
 * state so we can track the complete Razorpay
 * onboarding lifecycle.
 */
export async function createRouteAccount({
  creatorId,
  razorpayAccountId,
  status = 'created',
}) {
  await ensureRouteAccountIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    throw new Error(
      'Creator ID is required.',
    )
  }


  if (
    typeof razorpayAccountId !== 'string' ||
    razorpayAccountId.trim() === ''
  ) {
    throw new Error(
      'Razorpay Account ID is required.',
    )
  }


  const now = new Date()


  const document = {
    creatorId:
      creatorId.trim(),

    razorpayAccountId:
      razorpayAccountId.trim(),

    razorpayAccountStatus:
      status,

    stakeholderId:
      null,

    productId:
      null,

    productActivationStatus:
      null,

    onboardingStatus:
      'LINKED_ACCOUNT_CREATED',

    requirements:
      [],

    createdAt:
      now,

    updatedAt:
      now,
  }


  const result =
    await routeAccountsCollection().insertOne(
      document,
    )


  return routeAccountsCollection().findOne({
    _id: result.insertedId,
  })
}


/*
 * Update Razorpay Route onboarding state
 * for an existing Creator account.
 */
export async function updateRouteAccountOnboarding(
  creatorId,
  {
    razorpayAccountStatus,
    stakeholderId,
    productId,
    productActivationStatus,
    onboardingStatus,
    requirements,
  } = {},
) {
  await ensureRouteAccountIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    return null
  }


  const update = {
    updatedAt:
      new Date(),
  }


  if (
    typeof razorpayAccountStatus === 'string' &&
    razorpayAccountStatus.trim() !== ''
  ) {
    update.razorpayAccountStatus =
      razorpayAccountStatus.trim()
  }


  if (
    typeof stakeholderId === 'string' &&
    stakeholderId.trim() !== ''
  ) {
    update.stakeholderId =
      stakeholderId.trim()
  }


  if (
    typeof productId === 'string' &&
    productId.trim() !== ''
  ) {
    update.productId =
      productId.trim()
  }


  if (
    typeof productActivationStatus === 'string' &&
    productActivationStatus.trim() !== ''
  ) {
    update.productActivationStatus =
      productActivationStatus.trim()
  }


  if (
    typeof onboardingStatus === 'string' &&
    onboardingStatus.trim() !== ''
  ) {
    update.onboardingStatus =
      onboardingStatus.trim()
  }


  if (Array.isArray(requirements)) {
    update.requirements =
      requirements
  }


  return routeAccountsCollection()
    .findOneAndUpdate(
      {
        creatorId:
          creatorId.trim(),
      },
      {
        $set: update,
      },
      {
        returnDocument: 'after',
      },
    )
}


/*
 * Update the internal Razorpay Linked Account
 * status.
 *
 * Kept as a small helper for cases where only
 * the Linked Account status changes.
 */
export async function updateRouteAccountStatus(
  creatorId,
  status,
) {
  await ensureRouteAccountIndexes()


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    return null
  }


  if (
    typeof status !== 'string' ||
    status.trim() === ''
  ) {
    return null
  }


  return routeAccountsCollection()
    .findOneAndUpdate(
      {
        creatorId:
          creatorId.trim(),
      },
      {
        $set: {
          razorpayAccountStatus:
            status.trim(),

          updatedAt:
            new Date(),
        },
      },
      {
        returnDocument: 'after',
      },
    )
}