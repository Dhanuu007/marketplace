export function validateProduct(input = {}) {
  const name = String(input.name ?? '').trim()

  const slug = String(input.slug ?? '').trim()

  const description =
    String(input.description ?? '').trim()

  const image = String(input.image ?? '').trim()

  const categoryId =
    String(input.categoryId ?? '').trim()

  const demoUrl =
    String(input.demoUrl ?? '').trim()

  const technology =
    String(input.technology ?? '').trim()

  const websiteZip =
    String(input.websiteZip ?? '').trim()

  const screenshots =
    Array.isArray(input.screenshots)
      ? input.screenshots
          .map((screenshot) =>
            String(screenshot ?? '').trim(),
          )
          .filter(Boolean)
      : []

  const price = Number(input.price)

  const isActive =
    input.isActive === undefined
      ? true
      : input.isActive === true ||
        input.isActive === 'true'


  if (!name) {
    throw new Error(
      'Website name is required',
    )
  }

  if (!slug) {
    throw new Error(
      'Website slug is required',
    )
  }

  if (!description) {
    throw new Error(
      'Website description is required',
    )
  }

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error(
      'Website price must be a valid non-negative number',
    )
  }

  if (!categoryId) {
    throw new Error(
      'Website category is required',
    )
  }

  if (!demoUrl) {
    throw new Error(
      'Website demo URL is required',
    )
  }

  if (!technology) {
    throw new Error(
      'Website technology is required',
    )
  }

  if (!websiteZip) {
    throw new Error(
      'Website ZIP file is required',
    )
  }

  if (screenshots.length > 5) {
    throw new Error(
      'You can add a maximum of 5 website screenshots',
    )
  }


  return {
    name,
    slug,
    description,
    price,
    image,
    categoryId,
    demoUrl,
    technology,
    screenshots,
    websiteZip,
    isActive,
  }
}


export function validateCreatorProduct(
  input = {},
  options = {},
) {
  const name =
    String(input.name ?? '').trim()

  const slug =
    String(input.slug ?? '').trim()

  const description =
    String(input.description ?? '').trim()

  const image =
    String(input.image ?? '').trim()

  const categoryId =
    String(input.categoryId ?? '').trim()

  const demoUrl =
    String(input.demoUrl ?? '').trim()

  const technology =
    String(input.technology ?? '').trim()

  const websiteZip =
    String(input.websiteZip ?? '').trim()

  const screenshots =
    Array.isArray(input.screenshots)
      ? input.screenshots
          .map((screenshot) =>
            String(
              screenshot ?? '',
            ).trim(),
          )
          .filter(Boolean)
      : []

  const price = Number(input.price)

  const requireWebsiteZip =
    options.requireWebsiteZip !== false


  if (!name) {
    throw new Error(
      'Website name is required',
    )
  }

  if (!slug) {
    throw new Error(
      'Website slug is required',
    )
  }

  if (!description) {
    throw new Error(
      'Website description is required',
    )
  }

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error(
      'Website price must be a valid non-negative number',
    )
  }

  if (!categoryId) {
    throw new Error(
      'Website category is required',
    )
  }

  if (!demoUrl) {
    throw new Error(
      'Website demo URL is required',
    )
  }

  if (!technology) {
    throw new Error(
      'Website technology is required',
    )
  }

  /*
   * A ZIP file is mandatory when creating
   * a new website listing.
   *
   * During editing, the existing ZIP file
   * remains stored on the product, so a new
   * ZIP upload is not required.
   */
  if (
    requireWebsiteZip &&
    !websiteZip
  ) {
    throw new Error(
      'Website ZIP file is required',
    )
  }

  if (screenshots.length > 5) {
    throw new Error(
      'You can add a maximum of 5 website screenshots',
    )
  }


  return {
    name,
    slug,
    description,
    price,
    image,
    categoryId,
    demoUrl,
    technology,
    screenshots,
    websiteZip,
  }
}