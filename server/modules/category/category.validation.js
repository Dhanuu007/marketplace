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

export function validateCategory(input = {}) {
  const name = cleanString(
    input.name ?? '',
    'Category name',
  )

  const slug = cleanString(
    input.slug ?? '',
    'Category slug',
  )

  const description = cleanString(
    input.description ?? '',
    'Category description',
  )

  const image = cleanString(
    input.image ?? '',
    'Category image',
  )

  if (!name) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Category name is required',
    )
  }

  if (!slug) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Category slug is required',
    )
  }

  if (!description) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Category description is required',
    )
  }

  if (!image) {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'Category image is required',
    )
  }

  const isActive = input.isActive ?? true

  if (typeof isActive !== 'boolean') {
    throw createHttpError(
      400,
      'INVALID_INPUT',
      'isActive must be a boolean',
    )
  }

  return {
    name,
    slug,
    description,
    image,
    isActive,
  }
}