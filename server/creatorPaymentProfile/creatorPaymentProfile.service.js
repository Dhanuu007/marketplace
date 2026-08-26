import {
  getPaymentProfileByCreatorId,
  createPaymentProfile,
  updatePaymentProfile,
  deletePaymentProfile,
} from './creatorPaymentProfile.repository.js'



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



export async function getCreatorPaymentProfile(
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


  return getPaymentProfileByCreatorId(
    creatorId.trim(),
  )
}



export async function saveCreatorPaymentProfile(
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


  const accountHolderName =
    normalizeString(
      input.accountHolderName,
    )

  const bankName =
    normalizeString(
      input.bankName,
    )

  const accountNumber =
    normalizeString(
      input.accountNumber,
    )

  const ifscCode =
    normalizeString(
      input.ifscCode,
    ).toUpperCase()

  const upiId =
    normalizeString(
      input.upiId,
    )


  if (
    accountHolderName === '' &&
    bankName === '' &&
    accountNumber === '' &&
    ifscCode === '' &&
    upiId === ''
  ) {
    throw createValidationError(
      'At least one payment detail is required.',
    )
  }


  if (accountNumber !== '') {
    const accountNumberPattern =
      /^\d{9,18}$/

    if (
      !accountNumberPattern.test(
        accountNumber,
      )
    ) {
      throw createValidationError(
        'Bank account number must contain 9 to 18 digits.',
      )
    }
  }


  if (ifscCode !== '') {
    const ifscPattern =
      /^[A-Z]{4}0[A-Z0-9]{6}$/

    if (!ifscPattern.test(ifscCode)) {
      throw createValidationError(
        'Invalid IFSC code.',
      )
    }
  }


  const existingProfile =
    await getPaymentProfileByCreatorId(
      creatorId.trim(),
    )


  if (existingProfile) {
    return updatePaymentProfile(
      creatorId.trim(),
      {
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
        upiId,
      },
    )
  }


  return createPaymentProfile({
    creatorId: creatorId.trim(),
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    upiId,
  })
}



export async function removeCreatorPaymentProfile(
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


  return deletePaymentProfile(
    creatorId.trim(),
  )
}