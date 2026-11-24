
import { Router } from 'express'
import {
  homepageGalleryUpload,
} from '../../middleware/upload.js'
import {
  requireAuth,
  requireRole,
  optionalAuth,
} from '../../middleware/auth.js'

import { USER_ROLES } from '../auth/auth.constants.js'

import {
  validateHomepage,
  validateWebsiteSettings,
} from './website.validation.js'

import {
  getHomepageContent,
  getPublicHomepageContent,
  updateHomepageContent,
  getWebsiteSettingsContent,
  updateWebsiteSettingsContent,
} from './website.service.js'

const router = Router()


// Public Marketplace Homepage
router.get(
  '/website/homepage/public',
  optionalAuth,
  async (request, response, next) => {
    try {
      const homepage =
        await getPublicHomepageContent(
          request.user,
        )

      response.json({
        homepage,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin Homepage Management
router.get(
  '/website/homepage',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const homepage = await getHomepageContent()

      response.json({
        homepage,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin Homepage Update
router.put(
  '/website/homepage',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const input = validateHomepage(request.body)

      const homepage = await updateHomepageContent(input)

      response.json({
        homepage,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin Homepage Gallery Image Upload
router.post(
  '/website/homepage/gallery/upload',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  homepageGalleryUpload,
  async (request, response, next) => {
    try {
      const files = request.files ?? []

      if (files.length === 0) {
        return response.status(400).json({
          message: 'Please select at least one image.',
        })
      }

      const images = files.map((file) => ({
        imageUrl: `/uploads/gallery/${file.filename}`,
        title: '',
        order: 0,
      }))

      response.status(201).json({
        message: 'Gallery images uploaded successfully.',
        images,
      })
    } catch (error) {
      next(error)
    }
  },
)



// Public Website Settings
// Expose only settings needed by public-facing pages.
router.get(
  '/website/settings/public',
  async (request, response, next) => {
    try {
      const settings =
        await getWebsiteSettingsContent()

      response.set('Cache-Control', 'no-store')

      response.json({
        settings: {
          paymentsEnabled:
            settings.paymentsEnabled ?? true,

          announcementEnabled:
            settings.announcementEnabled ?? false,

          announcementMessage:
            settings.announcementMessage ?? '',
        },
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin Website Settings
router.get(
  '/website/settings',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const settings =
        await getWebsiteSettingsContent()

      response.json({
        settings,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin Website Settings Update
router.put(
  '/website/settings',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const input =
        validateWebsiteSettings(
          request.body,
        )

      const settings =
        await updateWebsiteSettingsContent(
          input,
        )

      response.json({
        settings,
      })
    } catch (error) {
      next(error)
    }
  },
)

export default router
