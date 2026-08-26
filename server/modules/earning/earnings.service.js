import {
  createEarning,
  getEarningsByCreatorId,
  getEarningByOrderAndProduct,
  getAllEarnings,
  markEarningAsPaid,
} from './earnings.repository.js'


import {
  getWebsiteSettings,
} from '../website/website.repository.js'


import {
  getPaymentProfileByCreatorId,
} from '../../creatorPaymentProfile/creatorPaymentProfile.repository.js'


function createValidationError(message) {
  const error = new Error(message)

  error.statusCode = 400

  return error
}


function createNotFoundError(message) {
  const error = new Error(message)

  error.statusCode = 404

  return error
}


export async function createCreatorEarning({
  orderId,
  productId,
  creatorId,
  creatorName,
  grossAmount,
}) {
  if (
    typeof orderId !== 'string' ||
    orderId.trim() === ''
  ) {
    const error = new Error(
      'Order ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    typeof productId !== 'string' ||
    productId.trim() === ''
  ) {
    const error = new Error(
      'Product ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    const error = new Error(
      'Creator ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  const amount = Number(grossAmount)


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    const error = new Error(
      'Invalid earning amount.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Prevent duplicate Creator earnings
   * for the same Marketplace order and website.
   */
  const existingEarning =
    await getEarningByOrderAndProduct(
      orderId.trim(),
      productId.trim(),
    )


  if (existingEarning) {
    return existingEarning
  }


  /*
   * Get the current marketplace commission
   * from Website Settings.
   *
   * Example:
   *
   * 5%    → 0.05
   * 7%    → 0.07
   * 10%   → 0.10
   * 12.5% → 0.125
   *
   * If Website Settings does not exist,
   * safely fall back to 5%.
   */
  const websiteSettings =
    await getWebsiteSettings()


  const commissionPercentage =
    Number(
      websiteSettings?.commissionPercentage ?? 5,
    )


  const commissionRate =
    commissionPercentage / 100


  /*
   * Marketplace commission.
   */
  const commissionAmount =
    Number(
      (
        amount *
        commissionRate
      ).toFixed(2),
    )


  /*
   * Creator receives the remaining amount.
   */
  const creatorAmount =
    Number(
      (
        amount -
        commissionAmount
      ).toFixed(2),
    )


  const earning = await createEarning({
    orderId: orderId.trim(),

    productId: productId.trim(),

    creatorId: creatorId.trim(),

    creatorName:
      typeof creatorName === 'string'
        ? creatorName.trim()
        : '',

    grossAmount: amount,

    commissionRate,

    commissionAmount,

    creatorAmount,

    status: 'PENDING',
  })


  return earning
}


/*
 * Get earnings for the current Creator.
 *
 * Existing Creator functionality remains unchanged.
 */
export async function getCreatorEarnings(
  creatorId,
) {
  const earnings =
    await getEarningsByCreatorId(
      creatorId,
    )


  return earnings
}


/*
 * Get all Creator earnings for Admin Payouts.
 *
 * Each earning is enriched with the Creator's
 * current payment profile.
 */
export async function getAdminPayouts() {
  const earnings =
    await getAllEarnings()


  const payouts =
    await Promise.all(
      earnings.map(
        async (earning) => {
          const paymentProfile =
            await getPaymentProfileByCreatorId(
              earning.creatorId,
            )


          return {
            id: earning._id.toString(),

            orderId: earning.orderId,

            productId: earning.productId,

            creatorId: earning.creatorId,

            creatorName:
              earning.creatorName ?? '',

            grossAmount:
              Number(
                earning.grossAmount ?? 0,
              ),

            commissionRate:
              Number(
                earning.commissionRate ?? 0,
              ),

            commissionAmount:
              Number(
                earning.commissionAmount ?? 0,
              ),

            creatorAmount:
              Number(
                earning.creatorAmount ?? 0,
              ),

            status:
              earning.status ?? 'PENDING',

            createdAt:
              earning.createdAt,

            paidAt:
              earning.paidAt ?? null,

            paymentDetails:
              earning.paymentDetails ??
              null,

            paymentProfile:
              paymentProfile
                ? {
                    accountHolderName:
                      paymentProfile.accountHolderName ??
                      '',

                    bankName:
                      paymentProfile.bankName ??
                      '',

                    accountNumber:
                      paymentProfile.accountNumber ??
                      '',

                    ifscCode:
                      paymentProfile.ifscCode ??
                      '',

                    upiId:
                      paymentProfile.upiId ??
                      '',
                  }
                : null,
          }
        },
      ),
    )


  return payouts
}


/*
 * Mark a pending Creator earning as paid.
 *
 * The current Creator payment profile is copied
 * into the earning record as a historical snapshot.
 */
export async function markCreatorEarningAsPaid(
  earningId,
) {
  if (
    typeof earningId !== 'string' ||
    earningId.trim() === ''
  ) {
    throw createValidationError(
      'Earning ID is required.',
    )
  }


  const earnings =
    await getAllEarnings()


  const earning =
    earnings.find(
      (item) =>
        item._id.toString() ===
        earningId.trim(),
    )


  if (!earning) {
    throw createNotFoundError(
      'Earning not found.',
    )
  }


  if (earning.status !== 'PENDING') {
    throw createValidationError(
      'Only pending earnings can be marked as paid.',
    )
  }


  const paymentProfile =
    await getPaymentProfileByCreatorId(
      earning.creatorId,
    )


  if (!paymentProfile) {
    throw createValidationError(
      'Creator payment details are not available.',
    )
  }


  const hasBankDetails =
    Boolean(
      paymentProfile.accountHolderName &&
      paymentProfile.bankName &&
      paymentProfile.accountNumber &&
      paymentProfile.ifscCode,
    )


  const hasUpiDetails =
    Boolean(
      paymentProfile.upiId,
    )


  if (
    !hasBankDetails &&
    !hasUpiDetails
  ) {
    throw createValidationError(
      'Creator has not provided complete bank or UPI payment details.',
    )
  }


  const paymentDetails = {
    accountHolderName:
      paymentProfile.accountHolderName ??
      '',

    bankName:
      paymentProfile.bankName ??
      '',

    accountNumber:
      paymentProfile.accountNumber ??
      '',

    ifscCode:
      paymentProfile.ifscCode ??
      '',

    upiId:
      paymentProfile.upiId ??
      '',
  }


  const updatedEarning =
    await markEarningAsPaid(
      earningId.trim(),
      paymentDetails,
    )


  if (!updatedEarning) {
    throw createValidationError(
      'Earning is no longer pending or could not be marked as paid.',
    )
  }


  return {
    id:
      updatedEarning._id.toString(),

    orderId:
      updatedEarning.orderId,

    productId:
      updatedEarning.productId,

    creatorId:
      updatedEarning.creatorId,

    creatorName:
      updatedEarning.creatorName ?? '',

    grossAmount:
      Number(
        updatedEarning.grossAmount ?? 0,
      ),

    commissionRate:
      Number(
        updatedEarning.commissionRate ?? 0,
      ),

    commissionAmount:
      Number(
        updatedEarning.commissionAmount ?? 0,
      ),

    creatorAmount:
      Number(
        updatedEarning.creatorAmount ?? 0,
      ),

    status:
      updatedEarning.status,

    paymentDetails:
      updatedEarning.paymentDetails ??
      null,

    createdAt:
      updatedEarning.createdAt,

    paidAt:
      updatedEarning.paidAt ??
      null,
  }
}