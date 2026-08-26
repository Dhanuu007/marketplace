import { Router } from 'express'

import {
  requireAuth,
  requireRole,
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
  async (request, response, next) => {
    try {
      const homepage = await getPublicHomepageContent()

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

// =========================
// Admin Website Settings
// =========================

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