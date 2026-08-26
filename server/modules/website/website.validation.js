import { createHttpError } from '../../utils/httpError.js'

function cleanString(value, fieldName) {
  if (typeof value !== 'string') {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      `${fieldName} must be a string`,
    )
  }

  return value.trim()
}

function validateBanner(input = {}) {
  const label = cleanString(
    input.label ?? '',
    'Banner label',
  )

  const heading = cleanString(
    input.heading ?? '',
    'Banner heading',
  )

  const description = cleanString(
    input.description ?? '',
    'Banner description',
  )

  const buttonText = cleanString(
    input.buttonText ?? '',
    'Banner button text',
  )

  const isActive = input.isActive ?? true

  if (typeof isActive !== 'boolean') {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Banner active status must be a boolean',
    )
  }

  if (!label) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Banner label is required',
    )
  }

  if (!heading) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Banner heading is required',
    )
  }

  if (!description) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Banner description is required',
    )
  }

  if (!buttonText) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Banner button text is required',
    )
  }

  return {
    label,
    heading,
    description,
    buttonText,
    isActive,
  }
}

function validateSections(input = {}) {
  const sections = {
    hero: input.hero ?? true,
    categories: input.categories ?? true,
    products: input.products ?? true,
    banner: input.banner ?? true,
  }

  for (const [sectionName, value] of Object.entries(sections)) {
    if (typeof value !== 'boolean') {
      throw createHttpError(
        400,
        'INVALID_INPUT',
        `${sectionName} section status must be a boolean`,
      )
    }
  }

  return sections
}

export function validateHomepage(input = {}) {
  const heading = cleanString(
    input.heading ?? '',
    'Heading',
  )

  const description = cleanString(
    input.description ?? '',
    'Description',
  )

  const buttonText = cleanString(
    input.buttonText ?? '',
    'Button text',
  )

  if (!heading) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Homepage heading is required',
    )
  }

  if (!description) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Homepage description is required',
    )
  }

  if (!buttonText) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Homepage button text is required',
    )
  }

  const featuredCategoryIds =
    input.featuredCategoryIds ?? []

  if (!Array.isArray(featuredCategoryIds)) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Featured category IDs must be an array',
    )
  }

  for (const categoryId of featuredCategoryIds) {
    if (
      typeof categoryId !== 'string' ||
      !categoryId.trim()
    ) {
      throw createHttpError(
        400,
        'INVALID_INPUT',
        'Featured category IDs must contain valid strings',
      )
    }
  }

  const featuredProductIds =
    input.featuredProductIds ?? []

  if (!Array.isArray(featuredProductIds)) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Featured product IDs must be an array',
    )
  }

  for (const productId of featuredProductIds) {
    if (
      typeof productId !== 'string' ||
      !productId.trim()
    ) {
      throw createHttpError(
        400,
        'INVALID_INPUT',
        'Featured product IDs must contain valid strings',
      )
    }
  }

  const banner = validateBanner(
    input.banner ?? {},
  )

  const sections = validateSections(
    input.sections ?? {},
  )

  return {
    heading,
    description,
    buttonText,
    featuredCategoryIds,
    featuredProductIds,
    banner,
    sections,
  }
}

export function validateWebsiteSettings(input = {}) {
  const marketplaceName = cleanString(
    input.marketplaceName ?? '',
    'Marketplace name',
  )

  const marketplaceDescription = cleanString(
    input.marketplaceDescription ?? '',
    'Marketplace description',
  )

  const supportEmail = cleanString(
    input.supportEmail ?? '',
    'Support email',
  )

  const currency = cleanString(
    input.currency ?? 'INR',
    'Currency',
  )

  const commissionPercentage =
    input.commissionPercentage ?? 5

  if (
    typeof commissionPercentage !== 'number' ||
    Number.isNaN(commissionPercentage)
  ) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Commission percentage must be a number',
    )
  }

  if (
    commissionPercentage < 0 ||
    commissionPercentage > 100
  ) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Commission percentage must be between 0 and 100',
    )
  }

  const marketplaceActive =
    input.marketplaceActive ?? true

  if (typeof marketplaceActive !== 'boolean') {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Marketplace active status must be a boolean',
    )
  }

  const contactEmail = cleanString(
    input.contactEmail ?? '',
    'Contact email',
  )

  const phone = cleanString(
    input.phone ?? '',
    'Phone',
  )

  const socialLinks = input.socialLinks ?? {}

  if (
    typeof socialLinks !== 'object' ||
    Array.isArray(socialLinks)
  ) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Social links must be an object',
    )
  }

  const seo = input.seo ?? {}

  if (
    typeof seo !== 'object' ||
    Array.isArray(seo)
  ) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'SEO settings must be an object',
    )
  }

  return {
    marketplaceName,
    marketplaceDescription,
    supportEmail,
    currency,
    commissionPercentage,
    marketplaceActive,
    contactEmail,
    phone,

    socialLinks: {
      instagram: cleanString(
        socialLinks.instagram ?? '',
        'Instagram URL',
      ),

      facebook: cleanString(
        socialLinks.facebook ?? '',
        'Facebook URL',
      ),

      linkedin: cleanString(
        socialLinks.linkedin ?? '',
        'LinkedIn URL',
      ),

      twitter: cleanString(
        socialLinks.twitter ?? '',
        'Twitter URL',
      ),
    },

    seo: {
      metaTitle: cleanString(
        seo.metaTitle ?? '',
        'SEO meta title',
      ),

      metaDescription: cleanString(
        seo.metaDescription ?? '',
        'SEO meta description',
      ),
    },
  }
}