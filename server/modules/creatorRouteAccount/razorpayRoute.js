const RAZORPAY_ROUTE_BASE_URL =
  'https://api.razorpay.com/v2'


function getRazorpayCredentials() {
  const keyId =
    process.env.RAZORPAY_KEY_ID

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET


  if (
    typeof keyId !== 'string' ||
    keyId.trim() === ''
  ) {
    const error = new Error(
      'Razorpay key ID is not configured.',
    )

    error.statusCode = 500

    throw error
  }


  if (
    typeof keySecret !== 'string' ||
    keySecret.trim() === ''
  ) {
    const error = new Error(
      'Razorpay key secret is not configured.',
    )

    error.statusCode = 500

    throw error
  }


  return {
    keyId: keyId.trim(),
    keySecret: keySecret.trim(),
  }
}


function createBasicAuthHeader(
  keyId,
  keySecret,
) {
  const credentials =
    `${keyId}:${keySecret}`


  return Buffer
    .from(credentials)
    .toString('base64')
}


/*
 * Create a Razorpay Route Linked Account.
 *
 * This function only performs the Razorpay API
 * request. It does not create or update any
 * Marketplace database record.
 *
 * The caller must provide the complete
 * Linked Account onboarding information.
 */
export async function createRazorpayLinkedAccount({
  email,
  phone,
  legalBusinessName,
  customerFacingBusinessName,
  businessType,
  referenceId,
  profile,
  legalInfo,
  contactInfo,
  apps,
}) {
  if (
    typeof email !== 'string' ||
    email.trim() === ''
  ) {
    throw new Error(
      'Linked Account email is required.',
    )
  }


  if (
    typeof phone !== 'string' ||
    phone.trim() === ''
  ) {
    throw new Error(
      'Linked Account phone number is required.',
    )
  }


  if (
    typeof legalBusinessName !== 'string' ||
    legalBusinessName.trim() === ''
  ) {
    throw new Error(
      'Linked Account legal business name is required.',
    )
  }


  if (
    typeof businessType !== 'string' ||
    businessType.trim() === ''
  ) {
    throw new Error(
      'Linked Account business type is required.',
    )
  }


  if (
    !profile ||
    typeof profile !== 'object' ||
    Array.isArray(profile)
  ) {
    throw new Error(
      'Linked Account profile is required.',
    )
  }


  const {
    keyId,
    keySecret,
  } =
    getRazorpayCredentials()


  const requestBody = {
    email: email.trim(),

    phone: phone.trim(),

    type: 'route',

    legal_business_name:
      legalBusinessName.trim(),

    customer_facing_business_name:
      typeof customerFacingBusinessName ===
      'string' &&
      customerFacingBusinessName.trim() !== ''
        ? customerFacingBusinessName.trim()
        : legalBusinessName.trim(),

    business_type:
      businessType.trim(),

    profile,
  }


  if (
    typeof referenceId === 'string' &&
    referenceId.trim() !== ''
  ) {
    requestBody.reference_id =
      referenceId.trim()
  }


  if (
    legalInfo &&
    typeof legalInfo === 'object' &&
    !Array.isArray(legalInfo)
  ) {
    requestBody.legal_info =
      legalInfo
  }


  if (
    contactInfo &&
    typeof contactInfo === 'object' &&
    !Array.isArray(contactInfo)
  ) {
    requestBody.contact_info =
      contactInfo
  }


  if (
    apps &&
    typeof apps === 'object' &&
    !Array.isArray(apps)
  ) {
    requestBody.apps =
      apps
  }


  const response =
    await fetch(
      `${RAZORPAY_ROUTE_BASE_URL}/accounts`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Basic ${createBasicAuthHeader(
              keyId,
              keySecret,
            )}`,

          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(
          requestBody,
        ),
      },
    )


  const responseData =
    await response.json()


  if (!response.ok) {
    const errorMessage =
      responseData?.error?.description ||
      responseData?.error?.message ||
      'Unable to create Razorpay Linked Account.'


    const error =
      new Error(errorMessage)


    error.statusCode =
      response.status


    error.razorpayResponse =
      responseData


    throw error
  }


  return responseData
}


/*
 * Fetch an existing Razorpay Route
 * Linked Account.
 */
export async function getRazorpayLinkedAccount(
  razorpayAccountId,
) {
  if (
    typeof razorpayAccountId !== 'string' ||
    razorpayAccountId.trim() === ''
  ) {
    throw new Error(
      'Razorpay Account ID is required.',
    )
  }


  const {
    keyId,
    keySecret,
  } =
    getRazorpayCredentials()


  const response =
    await fetch(
      `${RAZORPAY_ROUTE_BASE_URL}/accounts/${encodeURIComponent(
        razorpayAccountId.trim(),
      )}`,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Basic ${createBasicAuthHeader(
              keyId,
              keySecret,
            )}`,

          'Content-Type':
            'application/json',
        },
      },
    )


  const responseData =
    await response.json()


  if (!response.ok) {
    const errorMessage =
      responseData?.error?.description ||
      responseData?.error?.message ||
      'Unable to fetch Razorpay Linked Account.'


    const error =
      new Error(errorMessage)


    error.statusCode =
      response.status


    error.razorpayResponse =
      responseData


    throw error
  }


  return responseData
}

/*
 * Create the Razorpay Route stakeholder
 * for a Linked Account.
 */
export async function createRazorpayStakeholder(
  razorpayAccountId,
  {
    name,
    email,
    percentageOwnership,
    relationship,
    phone,
    addresses,
    notes,
  },
) {
  if (
    typeof razorpayAccountId !== 'string' ||
    razorpayAccountId.trim() === ''
  ) {
    throw new Error(
      'Razorpay Account ID is required.',
    )
  }


  if (
    typeof name !== 'string' ||
    name.trim() === ''
  ) {
    throw new Error(
      'Stakeholder name is required.',
    )
  }


  if (
    typeof email !== 'string' ||
    email.trim() === ''
  ) {
    throw new Error(
      'Stakeholder email is required.',
    )
  }


  const {
    keyId,
    keySecret,
  } =
    getRazorpayCredentials()


  const requestBody = {
    name: name.trim(),

    email: email.trim(),
  }


  if (
    Number.isFinite(
      Number(percentageOwnership),
    )
  ) {
    requestBody.percentage_ownership =
      Number(
        Number(
          percentageOwnership,
        ).toFixed(2),
      )
  }


  if (
    relationship &&
    typeof relationship === 'object' &&
    !Array.isArray(relationship)
  ) {
    requestBody.relationship =
      relationship
  }


  if (
    phone &&
    typeof phone === 'object' &&
    !Array.isArray(phone)
  ) {
    requestBody.phone =
      phone
  }


  if (
    addresses &&
    typeof addresses === 'object' &&
    !Array.isArray(addresses)
  ) {
    requestBody.addresses =
      addresses
  }


  if (
    notes &&
    typeof notes === 'object' &&
    !Array.isArray(notes)
  ) {
    requestBody.notes =
      notes
  }


  const response =
    await fetch(
      `${RAZORPAY_ROUTE_BASE_URL}/accounts/${encodeURIComponent(
        razorpayAccountId.trim(),
      )}/stakeholders`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Basic ${createBasicAuthHeader(
              keyId,
              keySecret,
            )}`,

          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(
          requestBody,
        ),
      },
    )


  const responseData =
    await response.json()


  if (!response.ok) {
    const errorMessage =
      responseData?.error?.description ||
      responseData?.error?.message ||
      'Unable to create Razorpay stakeholder.'


    const error =
      new Error(errorMessage)


    error.statusCode =
      response.status


    error.razorpayResponse =
      responseData


    throw error
  }


  return responseData
}

/*
 * Request the Razorpay Route product
 * configuration for a Linked Account.
 */
export async function requestRazorpayRouteProduct(
  razorpayAccountId,
) {
  if (
    typeof razorpayAccountId !== 'string' ||
    razorpayAccountId.trim() === ''
  ) {
    throw new Error(
      'Razorpay Account ID is required.',
    )
  }


  const {
    keyId,
    keySecret,
  } =
    getRazorpayCredentials()


  const response =
    await fetch(
      `${RAZORPAY_ROUTE_BASE_URL}/accounts/${encodeURIComponent(
        razorpayAccountId.trim(),
      )}/products`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Basic ${createBasicAuthHeader(
              keyId,
              keySecret,
            )}`,

          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          product_name: 'route',

          tnc_accepted: true,
        }),
      },
    )


  const responseData =
    await response.json()


  if (!response.ok) {
    const errorMessage =
      responseData?.error?.description ||
      responseData?.error?.message ||
      'Unable to request Razorpay Route product configuration.'


    const error =
      new Error(errorMessage)


    error.statusCode =
      response.status


    error.razorpayResponse =
      responseData


    throw error
  }


  return responseData
}


/*
 * Update the Route product configuration
 * with the Creator's settlement bank details.
 */
export async function updateRazorpayRouteProduct(
  razorpayAccountId,
  productId,
  {
    accountNumber,
    ifscCode,
    beneficiaryName,
    tncAccepted = true,
  },
) {
  if (
    typeof razorpayAccountId !== 'string' ||
    razorpayAccountId.trim() === ''
  ) {
    throw new Error(
      'Razorpay Account ID is required.',
    )
  }


  if (
    typeof productId !== 'string' ||
    productId.trim() === ''
  ) {
    throw new Error(
      'Razorpay Route Product ID is required.',
    )
  }


  if (
    typeof accountNumber !== 'string' ||
    accountNumber.trim() === ''
  ) {
    throw new Error(
      'Settlement account number is required.',
    )
  }


  if (
    typeof ifscCode !== 'string' ||
    ifscCode.trim() === ''
  ) {
    throw new Error(
      'Settlement IFSC code is required.',
    )
  }


  if (
    typeof beneficiaryName !== 'string' ||
    beneficiaryName.trim() === ''
  ) {
    throw new Error(
      'Settlement beneficiary name is required.',
    )
  }


  const {
    keyId,
    keySecret,
  } =
    getRazorpayCredentials()


  const requestBody = {
    settlements: {
      account_number:
        accountNumber.trim(),

      ifsc_code:
        ifscCode.trim().toUpperCase(),

      beneficiary_name:
        beneficiaryName.trim(),
    },

    tnc_accepted:
      Boolean(tncAccepted),
  }


  const response =
    await fetch(
      `${RAZORPAY_ROUTE_BASE_URL}/accounts/${encodeURIComponent(
        razorpayAccountId.trim(),
      )}/products/${encodeURIComponent(
        productId.trim(),
      )}`,
      {
        method: 'PATCH',

        headers: {
          Authorization:
            `Basic ${createBasicAuthHeader(
              keyId,
              keySecret,
            )}`,

          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(
          requestBody,
        ),
      },
    )


  const responseData =
    await response.json()


  if (!response.ok) {
    const errorMessage =
      responseData?.error?.description ||
      responseData?.error?.message ||
      'Unable to update Razorpay Route product configuration.'


    const error =
      new Error(errorMessage)


    error.statusCode =
      response.status


    error.razorpayResponse =
      responseData


    throw error
  }


  return responseData
}