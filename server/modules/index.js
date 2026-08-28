import { Router } from 'express'

import authRoutes from './auth/auth.routes.js'
import healthRoutes from './health/health.routes.js'
import websiteRoutes from './website/website.routes.js'
import categoryRoutes from './category/category.routes.js'
import productRoutes from './product/product.routes.js'
import orderRoutes from './order/order.routes.js'
import chatRoutes from './chat/chat.routes.js'
import notificationRoutes from './notification/notification.routes.js'
import adminRoutes from './admin/admin.routes.js'
import earningsRoutes from './earning/earnings.routes.js'
import creatorPaymentProfileRoutes from '../creatorPaymentProfile/creatorPaymentProfile.routes.js'
import creatorRouteAccountRoutes from './creatorRouteAccount/creatorRouteAccount.routes.js'
import paymentRoutes from '../services/payments/payment.routes.js'

const router = Router()

router.use(healthRoutes)

router.get('/debug-route', (request, response) => {
  response.json({
    status: 'ok',
    message: 'API router is working',
  })
})

router.use(authRoutes)
router.use(websiteRoutes)
router.use(categoryRoutes)
router.use(productRoutes)
router.use(chatRoutes)
router.use(notificationRoutes)
router.use(orderRoutes)
router.use(adminRoutes)
router.use(paymentRoutes)
router.use(earningsRoutes)
router.use(creatorPaymentProfileRoutes)
router.use(creatorRouteAccountRoutes)

export default router