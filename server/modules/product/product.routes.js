import { Router } from 'express'


import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import {
  creatorListingUpload,
  creatorScreenshotUpload,
} from '../../middleware/upload.js'

import { USER_ROLES } from '../auth/auth.constants.js'

import {
  validateProduct,
  validateCreatorProduct,
} from './product.validation.js'

import {
  getAllProducts,
  getAllAdminProducts,
  getSingleProduct,
  getProductsForCategory,
  getCreatorProducts,
  getSingleCreatorProduct,
  addProduct,
  addCreatorProduct,
  editCreatorProduct,
  reviewProduct,
  assignExistingProductToCreator,
  deleteAdminProduct,
  relistAdminProduct,
} from './product.service.js'


const router = Router()


// Public marketplace products
router.get(
  '/products/public',
  async (request, response, next) => {
    try {
      const products = await getAllProducts()

      response.json({
        products,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin product list
router.get(
  '/products/admin',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const products = await getAllAdminProducts()

      response.json({
        products,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Creator website listings
// IMPORTANT: This must come before /products/:productId
router.get(
  '/products/creator',
  requireAuth,
  requireRole(USER_ROLES.CREATOR),
  async (request, response, next) => {
    try {
      const products = await getCreatorProducts(
        request.user.id,
      )

      response.json({
        products,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Public single-product lookup
router.get(
  '/products/:productId',
  async (request, response, next) => {
    try {
      const product = await getSingleProduct(
        request.params.productId,
      )

      if (!product) {
        return response.status(404).json({
          message: 'Product not found.',
        })
      }

      response.json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Public products by category
router.get(
  '/products/category/:categoryId',
  async (request, response, next) => {
    try {
      const products = await getProductsForCategory(
        request.params.categoryId,
      )

      response.json({
        products,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Existing admin product list
router.get(
  '/products',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const products = await getAllProducts()

      response.json({
        products,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin create product
router.post(
  '/products',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  creatorListingUpload,
  async (request, response, next) => {
    try {
      const screenshotFiles =
        request.files?.screenshots ?? []

      const websiteZipFile =
        request.files?.websiteZip?.[0]

      const screenshotUrls =
        screenshotFiles.map(
          (file) =>
            `/uploads/screenshots/${file.filename}`,
        )

      if (!websiteZipFile) {
        const error = new Error(
          'Website ZIP file is required.',
        )

        error.statusCode = 400

        throw error
      }

      const websiteZip =
        `/uploads/websites/${websiteZipFile.filename}`

      const input = validateProduct({
        ...request.body,
        screenshots: screenshotUrls,
        websiteZip,
      })

      const product = await addProduct(input)

      response.status(201).json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Creator submit website listing
router.post(
  '/products/creator',
  requireAuth,
  requireRole(USER_ROLES.CREATOR),
  creatorListingUpload,
  async (request, response, next) => {
    try {
      const screenshotFiles =
        request.files?.screenshots ?? []

      const websiteZipFile =
        request.files?.websiteZip?.[0]


      const screenshotUrls = screenshotFiles.map(
        (file) =>
          `/uploads/screenshots/${file.filename}`,
      )


      if (!websiteZipFile) {
        const error = new Error(
          'Website ZIP file is required.',
        )

        error.statusCode = 400

        throw error
      }


      const websiteZip =
        `/uploads/websites/${websiteZipFile.filename}`


      const input = validateCreatorProduct({
        ...request.body,
        screenshots: screenshotUrls,
        websiteZip,
      })


      const product = await addCreatorProduct(
        input,
        request.user,
      )


      response.status(201).json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Creator single website listing
router.get(
  '/products/creator/:productId',
  requireAuth,
  requireRole(USER_ROLES.CREATOR),
  async (request, response, next) => {
    try {
      const product = await getSingleCreatorProduct(
        request.params.productId,
        request.user.id,
      )

      if (!product) {
        return response.status(404).json({
          message: 'Website listing not found.',
        })
      }

      response.json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Creator edit website listing
router.patch(
  '/products/creator/:productId',
  requireAuth,
  requireRole(USER_ROLES.CREATOR),
  creatorScreenshotUpload.array('screenshots', 5),
  async (request, response, next) => {
    try {
      const screenshotUrls = (request.files ?? []).map(
        (file) =>
          `/uploads/screenshots/${file.filename}`,
      )

      const existingScreenshots = Array.isArray(
        request.body.existingScreenshots,
      )
        ? request.body.existingScreenshots
        : request.body.existingScreenshots
          ? [request.body.existingScreenshots]
          : []

      const input = validateCreatorProduct(
        {
          ...request.body,
          screenshots: [
            ...existingScreenshots,
            ...screenshotUrls,
          ],
        },
        {
          requireWebsiteZip: false,
        },
      )

      const product = await editCreatorProduct(
        request.params.productId,
        request.user.id,
        input,
      )

      if (!product) {
        return response.status(404).json({
          message: 'Website listing not found.',
        })
      }

      response.json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin assign existing product to creator
router.patch(
  '/products/admin/:productId/assign-creator',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const {
        creatorId,
      } = request.body

      const product =
        await assignExistingProductToCreator(
          request.params.productId,
          creatorId,
        )

      response.json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin review website listing
router.patch(
  '/products/admin/:productId/review',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const { approvalStatus } = request.body

      const product = await reviewProduct(
        request.params.productId,
        approvalStatus,
      )

      if (!product) {
        return response.status(404).json({
          message: 'Product not found.',
        })
      }

      response.json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin soft-delete approved website listing
router.patch(
  '/products/admin/:productId/delete',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const product = await deleteAdminProduct(
        request.params.productId,
      )

      response.json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin re-list deleted website listing
router.patch(
  '/products/admin/:productId/relist',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const product = await relistAdminProduct(
        request.params.productId,
      )

      response.json({
        product,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router