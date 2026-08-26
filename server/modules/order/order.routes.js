import { Router } from 'express'


import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'


import {
  creatorDeliveryUpload,
} from '../../middleware/deliveryUpload.js'


import {
  createUserOrder,
  getUserOrders,
  getAllUserOrders,
  getCreatorOrders,
  updateUserOrderStatus,
  getUserOrder,
  provideOrderItemDelivery,
  getOrderDeliveryDownload,
  deleteAdminOrder,
} from './order.service.js'


import {
  validateCreateOrder,
} from './order.validation.js'


const router = Router()


// Create order
router.post(
  '/orders',
  requireAuth,
  async (request, response, next) => {
    try {
      const input = validateCreateOrder(
        request.body,
      )


      const order = await createUserOrder(
        request.user,
        input,
      )


      response.status(201).json({
        order,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Get all orders for admin
router.get(
  '/admin/orders',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const orders = await getAllUserOrders()


      response.json({
        orders,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Delete order for admin
router.delete(
  '/admin/orders/:orderId',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      await deleteAdminOrder(
        request.params.orderId,
      )

      response.json({
        message: 'Order deleted successfully.',
      })
    } catch (error) {
      next(error)
    }
  },
)


// Update order status for admin
router.patch(
  '/admin/orders/:orderId/status',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const status = request.body?.status


      const order = await updateUserOrderStatus(
        request.params.orderId,
        status,
      )


      response.json({
        order,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Get orders containing websites belonging to current creator
router.get(
  '/creator/orders',
  requireAuth,
  requireRole('CREATOR'),
  async (request, response, next) => {
    try {
      const orders = await getCreatorOrders(
        request.user.id,
      )


      response.json({
        orders,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Creator provide website delivery
router.post(
  '/creator/orders/:orderId/items/:productId/delivery',
  requireAuth,
  requireRole('CREATOR'),
  creatorDeliveryUpload.single('deliveryFile'),
  async (request, response, next) => {
    try {
      const deliveryFile = request.file
        ? {
            originalName:
              request.file.originalname,

            fileName:
              request.file.filename,

            size:
              request.file.size,

            mimeType:
              request.file.mimetype,
          }
        : null


      const order = await provideOrderItemDelivery(
        request.params.orderId,
        request.params.productId,
        request.user.id,
        {
          files: deliveryFile
            ? [deliveryFile]
            : [],

          demoUrl:
            request.body?.demoUrl ?? '',

          instructions:
            request.body?.instructions ?? '',

          support:
            request.body?.support ?? '',
        },
      )


      response.json({
        order,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Get current user's orders
router.get(
  '/orders',
  requireAuth,
  async (request, response, next) => {
    try {
      const orders = await getUserOrders(
        request.user.id,
      )


      response.json({
        orders,
      })
    } catch (error) {
      next(error)
    }
  },
)


// Download delivered website ZIP
router.get(
  '/orders/:orderId/items/:productId/delivery/download',
  requireAuth,
  async (request, response, next) => {
    try {
      const download =
        await getOrderDeliveryDownload(
          request.params.orderId,
          request.params.productId,
          request.user.id,
        )


      response.download(
        download.filePath,
        download.downloadName,
      )
    } catch (error) {
      next(error)
    }
  },
)


// Get one order belonging to current user
router.get(
  '/orders/:orderId',
  requireAuth,
  async (request, response, next) => {
    try {
      const order = await getUserOrder(
        request.params.orderId,
        request.user.id,
      )


      response.json({
        order,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router