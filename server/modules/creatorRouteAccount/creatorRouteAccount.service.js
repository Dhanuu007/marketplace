import {
  getRouteAccountByCreatorId,
  createRouteAccount,
  updateRouteAccountOnboarding,
} from './creatorRouteAccount.repository.js'


import {
  findUserById,
} from '../auth/user.repository.js'


import {
  createRazorpayLinkedAccount,
  createRazorpayStakeholder,
  requestRazorpayRouteProduct,
} from './razorpayRoute.js'


function createValidationError(message) {
  const error = new Error(message)

  error.statusCode = 400

  return error
}


function normalizeString(value) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}


export async function getCreatorRouteAccount(
  creatorId,
) {
  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    throw createValidationError(
      'Creator ID is required.',
    )
  }


  return getRouteAccountByCreatorId(
    creatorId.trim(),
  )
}


/*
 * Create the complete initial Razorpay
 * Route onboarding sequence.
 *
 * Sequence:
 *
 * 1. Create Linked Account
 * 2. Save Linked Account ID
 * 3. Create Stakeholder
 * 4. Request Route Product
 * 5. Save onboarding state
 */
export async function createCreatorRouteAccount(
  creatorId,
  input = {},
) {
  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    throw createValidationError(
      'Creator ID is required.',
    )
  }


  /*
   * Prevent duplicate Linked Accounts.
   */
  const existingAccount =
    await getRouteAccountByCreatorId(
      creatorId.trim(),
    )


  if (existingAccount) {
    throw createValidationError(
      'A Razorpay Route account already exists for this Creator.',
    )
  }


  /*
   * Verify the authenticated Creator.
   */
  const creator =
    await findUserById(
      creatorId.trim(),
    )


  if (!creator) {
    const error = new Error(
      'Creator account not found.',
    )

    error.statusCode = 404

    throw error
  }


  if (creator.role !== 'CREATOR') {
    throw createValidationError(
      'Only Creator accounts can create a Razorpay Route account.',
    )
  }


  /*
   * Creator / business information.
   */
  const email =
    normalizeString(input.email) ||
    normalizeString(creator.email)


  const phone =
    normalizeString(input.phone)


  const legalBusinessName =
    normalizeString(
      input.legalBusinessName,
    )


  const customerFacingBusinessName =
    normalizeString(
      input.customerFacingBusinessName,
    ) ||
    normalizeString(creator.name)


  const businessType =
    normalizeString(
      input.businessType,
    )


  const profile =
    input.profile


  const referenceId =
    `creator_${creator.id}`


  /*
   * Validate required Linked Account data.
   */
  if (email === '') {
    throw createValidationError(
      'Email is required.',
    )
  }


  if (phone === '') {
    throw createValidationError(
      'Phone number is required.',
    )
  }


  if (legalBusinessName === '') {
    throw createValidationError(
      'Legal business name is required.',
    )
  }


  if (businessType === '') {
    throw createValidationError(
      'Business type is required.',
    )
  }


  if (
    !profile ||
    typeof profile !== 'object' ||
    Array.isArray(profile)
  ) {
    throw createValidationError(
      'Business profile information is required.',
    )
  }


  /*
   * -----------------------------------------
   * STEP 1
   * Create Razorpay Linked Account.
   * -----------------------------------------
   */
  const razorpayAccount =
    await createRazorpayLinkedAccount({
      email,

      phone,

      legalBusinessName,

      customerFacingBusinessName,

      businessType,

      referenceId,

      profile,

      legalInfo:
        input.legalInfo,

      contactInfo:
        input.contactInfo,

      apps:
        input.apps,
    })


  if (
    !razorpayAccount?.id
  ) {
    const error = new Error(
      'Razorpay did not return a Linked Account ID.',
    )

    error.statusCode = 502

    throw error
  }


  /*
   * -----------------------------------------
   * STEP 2
   * Save Linked Account in our database.
   * -----------------------------------------
   */
  await createRouteAccount({
  creatorId:
    creator.id,

  razorpayAccountId:
    razorpayAccount.id,

  status:
    razorpayAccount.status ||
    'created',
})


  /*
   * -----------------------------------------
   * STEP 3
   * Create Razorpay Stakeholder.
   * -----------------------------------------
   */
  let stakeholder


  try {
    stakeholder =
      await createRazorpayStakeholder(
        razorpayAccount.id,
        {
          name:
            normalizeString(
              input.stakeholder?.name,
            ) ||
            normalizeString(
              creator.name,
            ),

          email,

          percentageOwnership:
            input.stakeholder
              ?.percentageOwnership,

          relationship:
            input.stakeholder
              ?.relationship,

          phone:
            input.stakeholder
              ?.phone,

          addresses:
            input.stakeholder
              ?.addresses,

          notes:
            input.stakeholder
              ?.notes,
        },
      )
  } catch (error) {
    await updateRouteAccountOnboarding(
      creator.id,
      {
        razorpayAccountStatus:
          razorpayAccount.status ||
          'created',

        onboardingStatus:
          'STAKEHOLDER_CREATION_FAILED',
      },
    )

    throw error
  }


  const stakeholderId =
    stakeholder?.id ||
    stakeholder?.stakeholder_id ||
    null


  if (!stakeholderId) {
    await updateRouteAccountOnboarding(
      creator.id,
      {
        razorpayAccountStatus:
          razorpayAccount.status ||
          'created',

        onboardingStatus:
          'STAKEHOLDER_ID_MISSING',
      },
    )

    const error = new Error(
      'Razorpay did not return a Stakeholder ID.',
    )

    error.statusCode = 502

    throw error
  }


  await updateRouteAccountOnboarding(
    creator.id,
    {
      razorpayAccountStatus:
        razorpayAccount.status ||
        'created',

      stakeholderId,

      onboardingStatus:
        'STAKEHOLDER_CREATED',
    },
  )


  /*
   * -----------------------------------------
   * STEP 4
   * Request Route Product.
   * -----------------------------------------
   */
  let routeProduct


  try {
    routeProduct =
      await requestRazorpayRouteProduct(
        razorpayAccount.id,
      )
  } catch (error) {
    await updateRouteAccountOnboarding(
      creator.id,
      {
        razorpayAccountStatus:
          razorpayAccount.status ||
          'created',

        stakeholderId,

        onboardingStatus:
          'ROUTE_PRODUCT_REQUEST_FAILED',
      },
    )

    throw error
  }


  const productId =
    routeProduct?.id ||
    routeProduct?.product_id ||
    null


  if (!productId) {
    await updateRouteAccountOnboarding(
      creator.id,
      {
        razorpayAccountStatus:
          razorpayAccount.status ||
          'created',

        stakeholderId,

        onboardingStatus:
          'ROUTE_PRODUCT_ID_MISSING',
      },
    )

    const error = new Error(
      'Razorpay did not return a Route Product ID.',
    )

    error.statusCode = 502

    throw error
  }


  /*
   * -----------------------------------------
   * STEP 5
   * Save Route Product state.
   * -----------------------------------------
   */
  const updatedRouteAccount =
    await updateRouteAccountOnboarding(
      creator.id,
      {
        razorpayAccountStatus:
          razorpayAccount.status ||
          'created',

        stakeholderId,

        productId,

        productActivationStatus:
          routeProduct.activation_status ||
          routeProduct.status ||
          null,

        onboardingStatus:
          'ROUTE_PRODUCT_REQUESTED',

        requirements:
          routeProduct.requirements ||
          [],
      },
    )


  return {
    routeAccount:
      updatedRouteAccount
        ? {
            id:
              updatedRouteAccount._id.toString(),

            creatorId:
              updatedRouteAccount.creatorId,

            razorpayAccountId:
              updatedRouteAccount
                .razorpayAccountId,

            razorpayAccountStatus:
              updatedRouteAccount
                .razorpayAccountStatus,

            stakeholderId:
              updatedRouteAccount
                .stakeholderId,

            productId:
              updatedRouteAccount
                .productId,

            productActivationStatus:
              updatedRouteAccount
                .productActivationStatus,

            onboardingStatus:
              updatedRouteAccount
                .onboardingStatus,

            requirements:
              updatedRouteAccount
                .requirements,

            createdAt:
              updatedRouteAccount
                .createdAt,

            updatedAt:
              updatedRouteAccount
                .updatedAt,
          }
        : null,

    razorpayAccount,

    stakeholder,

    routeProduct,
  }
}