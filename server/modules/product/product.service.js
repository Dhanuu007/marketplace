import {
  getProducts,
  getAllProductsForAdmin,
  getProductById,
  getProductsByCategory,
  getProductsForCreator,
  getProductForCreator,
  createProduct,
  updateProductForCreator,
  updateProductApproval,
  assignProductToCreator,
  deleteProduct,
  relistProduct,
} from './product.repository.js'

import { getCategoryById } from '../category/category.repository.js'
import { findUserById } from '../auth/user.repository.js'


export async function getAllProducts() {
  return getProducts()
}


export async function getAllAdminProducts() {
  return getAllProductsForAdmin()
}


export async function getSingleProduct(productId) {
  return getProductById(productId)
}


export async function getProductsForCategory(categoryId) {
  return getProductsByCategory(categoryId)
}


export async function getSingleCreatorProduct(
  productId,
  creatorId,
) {
  return getProductForCreator(
    productId,
    creatorId,
  )
}


export async function getCreatorProducts(creatorId) {
  const products =
    await getProductsForCreator(
      creatorId,
    )


  const productsWithCategory =
    await Promise.all(
      products.map(async (product) => {
        const category =
          await getCategoryById(
            product.categoryId,
          )


        return {
          ...product,

          categoryName:
            category?.name ||
            'Unknown Category',
        }
      }),
    )


  return productsWithCategory
}


export async function addProduct(input) {
  const category =
    await getCategoryById(
      input.categoryId,
    )


  if (!category) {
    const error = new Error(
      'Category not found or inactive.',
    )

    error.statusCode = 400

    throw error
  }


  return createProduct({
    name: input.name,

    slug: input.slug,

    description:
      input.description,

    price: input.price,

    image: input.image,

    categoryId:
      input.categoryId,

    demoUrl:
      input.demoUrl,

    technology:
      input.technology,

    screenshots:
      input.screenshots,

    websiteZip:
      input.websiteZip,

    approvalStatus:
      'APPROVED',

    isActive:
      input.isActive,
  })
}


export async function addCreatorProduct(
  input,
  creator,
) {
  const category =
    await getCategoryById(
      input.categoryId,
    )


  if (!category) {
    const error = new Error(
      'Category not found or inactive.',
    )

    error.statusCode = 400

    throw error
  }


  return createProduct({
    name: input.name,

    slug: input.slug,

    description:
      input.description,

    price: input.price,

    image: input.image,

    categoryId:
      input.categoryId,

    demoUrl:
      input.demoUrl,

    technology:
      input.technology,

    screenshots:
      input.screenshots,

    // Ready-made website ZIP
    websiteZip:
      input.websiteZip,

    creatorId:
      creator.id,

    creatorName:
      creator.name,

    approvalStatus:
      'PENDING',

    isActive:
      false,
  })
}


export async function editCreatorProduct(
  productId,
  creatorId,
  input,
) {
  const product =
    await getProductForCreator(
      productId,
      creatorId,
    )


  if (!product) {
    const error = new Error(
      'Website listing not found.',
    )

    error.statusCode = 404

    throw error
  }


  const category =
    await getCategoryById(
      input.categoryId,
    )


  if (!category) {
    const error = new Error(
      'Category not found or inactive.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * Once a website listing is approved,
   * its marketplace price is locked.
   *
   * The Creator may still update other
   * listing information, but cannot change
   * the approved selling price.
   */
  if (
    product.approvalStatus ===
      'APPROVED' &&
    Number(input.price) !==
      Number(product.price)
  ) {
    const error = new Error(
      'The price cannot be changed after the website listing has been approved.',
    )

    error.statusCode = 400

    throw error
  }


  const updates = {
    name: input.name,

    slug: input.slug,

    description:
      input.description,

    price: input.price,

    image: input.image,

    categoryId:
      input.categoryId,

    demoUrl:
      input.demoUrl,

    technology:
      input.technology,

    screenshots:
      input.screenshots,
  }


  /*
   * If a rejected website is edited,
   * send it back to Admin for review.
   */
  if (
    product.approvalStatus ===
    'REJECTED'
  ) {
    updates.approvalStatus =
      'PENDING'

    updates.isActive = false
  }


  return updateProductForCreator(
    productId,
    creatorId,
    updates,
  )
}


export async function reviewProduct(
  productId,
  approvalStatus,
) {
  if (
    approvalStatus ===
    'APPROVED'
  ) {
    return updateProductApproval(
      productId,
      'APPROVED',
      true,
    )
  }


  if (
    approvalStatus ===
    'REJECTED'
  ) {
    return updateProductApproval(
      productId,
      'REJECTED',
      false,
    )
  }


  throw new Error(
    'Invalid product approval status.',
  )
}


/*
 * Admin soft-deletes an approved listing.
 *
 * The product remains in the database,
 * but becomes invisible to Buyers and
 * unavailable to Creators.
 */
export async function deleteAdminProduct(
  productId,
) {
  if (
    typeof productId !==
      'string' ||
    productId.trim() === ''
  ) {
    const error = new Error(
      'Product ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  const product =
    await deleteProduct(
      productId.trim(),
    )


  if (!product) {
    const error = new Error(
      'Approved product not found or already deleted.',
    )

    error.statusCode = 404

    throw error
  }


  return product
}


/*
 * Admin restores a previously deleted
 * listing back to the marketplace.
 */
export async function relistAdminProduct(
  productId,
) {
  if (
    typeof productId !==
      'string' ||
    productId.trim() === ''
  ) {
    const error = new Error(
      'Product ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  const product =
    await relistProduct(
      productId.trim(),
    )


  if (!product) {
    const error = new Error(
      'Deleted product not found.',
    )

    error.statusCode = 404

    throw error
  }


  return product
}


export async function assignExistingProductToCreator(
  productId,
  creatorId,
) {
  if (
    typeof productId !==
      'string' ||
    productId.trim() === ''
  ) {
    const error = new Error(
      'Product ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    typeof creatorId !==
      'string' ||
    creatorId.trim() === ''
  ) {
    const error = new Error(
      'Creator ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  const creator =
    await findUserById(
      creatorId.trim(),
    )


  if (!creator) {
    const error = new Error(
      'Creator not found.',
    )

    error.statusCode = 404

    throw error
  }


  if (
    creator.role !==
    'CREATOR'
  ) {
    const error = new Error(
      'Selected user is not a creator.',
    )

    error.statusCode = 400

    throw error
  }


  const product =
    await assignProductToCreator(
      productId.trim(),
      creator.id,
      creator.name,
    )


  if (!product) {
    const error = new Error(
      'Product not found.',
    )

    error.statusCode = 404

    throw error
  }


  return product
}