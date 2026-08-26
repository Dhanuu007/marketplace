import { Router } from 'express'

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import { USER_ROLES } from '../auth/auth.constants.js'

import { validateCategory } from './category.validation.js'

import {
  getAllCategories,
  getSingleCategory,
  addCategory,
} from './category.service.js'


const router = Router()


// Public single-category lookup
router.get(
  '/categories/:slug',
  async (request, response, next) => {
    try {
      const category = await getSingleCategory(
        request.params.slug,
      )

      if (!category) {
        return response.status(404).json({
          message: 'Category not found.',
        })
      }

      response.json({
        category,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Public category list
router.get(
  '/categories',
  async (request, response, next) => {
    try {
      const categories = await getAllCategories()

      response.json({
        categories,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Admin create category
router.post(
  '/categories',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  async (request, response, next) => {
    try {
      const input = validateCategory(request.body)

      const category = await addCategory(input)

      response.status(201).json({
        category,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router