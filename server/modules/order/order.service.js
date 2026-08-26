import fs from 'fs'
import path from 'path'

import {
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  getOrdersByCreatorId,
  updateOrderItemDelivery,
  deleteOrder,
} from './order.repository.js'

import {
  getProductById,
} from '../product/product.repository.js'


export async function createUserOrder(
  user,
  input,
) {
  /*
   * Get the buyer's existing orders once.
   *
   * We use this to prevent a buyer from purchasing
   * the same website more than once after a
   * successful payment.
   *
   * PENDING orders are intentionally ignored so
   * that an unsuccessful/cancelled payment can
   * still be retried.
   */
  const existingOrders =
    await getOrdersByUserId(
      user.id,
    )


  const items = []

  let totalAmount = 0


  for (const requestedItem of input.items) {
    const product = await getProductById(
      requestedItem.productId,
    )


    if (!product) {
      const error = new Error(
        `Product not found: ${requestedItem.productId}`,
      )

      error.statusCode = 404

      throw error
    }


    /*
     * Prevent duplicate successful purchases.
     *
     * Only PAID orders block another purchase.
     *
     * PENDING/CANCELLED orders do not block the
     * buyer because payment may have failed or
     * been cancelled and should remain retryable.
     */
    const alreadyPurchased =
      existingOrders.some(
        (existingOrder) =>
          existingOrder.status === 'PAID' &&
          (existingOrder.items ?? []).some(
            (existingItem) =>
              existingItem.productId ===
              product._id.toString(),
          ),
      )


    if (alreadyPurchased) {
      const error = new Error(
        `You have already purchased "${product.name}".`,
      )

      error.statusCode = 400

      throw error
    }


    /*
     * Every Marketplace website listing must have
     * its ready-made website ZIP attached.
     *
     * The ZIP path is taken from the trusted
     * product record, never from the buyer request.
     */
    if (
      typeof product.websiteZip !== 'string' ||
      product.websiteZip.trim() === ''
    ) {
      const error = new Error(
        `Website ZIP is not available for: ${product.name}`,
      )

      error.statusCode = 400

      throw error
    }


    const quantity = requestedItem.quantity
    const price = Number(product.price)


    if (!Number.isFinite(price) || price < 0) {
      const error = new Error(
        `Invalid price for product: ${product.name}`,
      )

      error.statusCode = 400

      throw error
    }


    const itemTotal =
      price * quantity

    totalAmount += itemTotal


    items.push({
      productId:
        product._id.toString(),

      name:
        product.name,

      price,

      quantity,

      itemTotal,

      image:
        product.image ?? '',

      creatorId:
        product.creatorId ?? '',

      creatorName:
        product.creatorName ?? '',


      /*
       * Snapshot the exact Website ZIP that belongs
       * to this purchase.
       *
       * This prevents a future product-file replacement
       * from changing the file associated with an order.
       */
      websiteZip:
        product.websiteZip.trim(),


      delivery: {
        status:
          'NOT_DELIVERED',

        files: [],

        demoUrl:
          product.demoUrl ?? '',

        instructions:
          '',

        support:
          '',
      },
    })
  }


  const order =
    await createOrder({
      userId:
        user.id,

      customer:
        input.customer,

      items,

      totalAmount,

      /*
       * Marketplace order starts as PENDING.
       *
       * Razorpay payment must be successfully
       * verified before the order becomes PAID.
       */
      status:
        'PENDING',
    })


  return serializeOrder(
    order,
  )
}


export async function getUserOrders(
  userId,
) {
  const orders =
    await getOrdersByUserId(
      userId,
    )

  return orders.map(
    serializeOrder,
  )
}


export async function getAllUserOrders() {
  const orders =
    await getAllOrders()

  return orders.map(
    serializeOrder,
  )
}


export async function getCreatorOrders(
  creatorId,
) {
  const orders =
    await getOrdersByCreatorId(
      creatorId,
    )

  return orders.map(
    (order) => {
      const creatorItems =
        (order.items ?? []).filter(
          (item) =>
            item.creatorId ===
            creatorId,
        )

      return {
        id:
          order._id.toString(),

        customer:
          order.customer,

        items:
          creatorItems,

        totalAmount:
          creatorItems.reduce(
            (
              total,
              item,
            ) =>
              total +
              Number(
                item.itemTotal || 0,
              ),
            0,
          ),

        status:
          order.status,

        createdAt:
          order.createdAt,

        updatedAt:
          order.updatedAt,
      }
    },
  )
}


export async function updateUserOrderStatus(
  orderId,
  status,
) {
  const allowedStatuses = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]


  if (
    !allowedStatuses.includes(
      status,
    )
  ) {
    const error = new Error(
      'Invalid order status.',
    )

    error.statusCode = 400

    throw error
  }


  const order =
    await updateOrderStatus(
      orderId,
      status,
    )


  if (!order) {
    const error = new Error(
      'Order not found.',
    )

    error.statusCode = 404

    throw error
  }


  return serializeOrder(
    order,
  )
}


export async function deleteAdminOrder(
  orderId,
) {
  if (
    typeof orderId !== 'string' ||
    orderId.trim() === ''
  ) {
    const error = new Error(
      'Order ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  const deletedOrder =
    await deleteOrder(
      orderId.trim(),
    )


  if (!deletedOrder) {
    const error = new Error(
      'Order not found.',
    )

    error.statusCode = 404

    throw error
  }


  return serializeOrder(
    deletedOrder,
  )
}


export async function getUserOrder(
  orderId,
  userId,
) {
  const order =
    await getOrderById(
      orderId,
      userId,
    )


  if (!order) {
    const error = new Error(
      'Order not found.',
    )

    error.statusCode = 404

    throw error
  }


  return serializeOrder(
    order,
  )
}


export async function provideOrderItemDelivery(
  orderId,
  productId,
  creatorId,
  delivery,
) {
  if (
    typeof orderId !== 'string' ||
    orderId.trim() === ''
  ) {
    const error = new Error(
      'Order ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    typeof productId !== 'string' ||
    productId.trim() === ''
  ) {
    const error = new Error(
      'Product ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === ''
  ) {
    const error = new Error(
      'Creator ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  const demoUrl =
    typeof delivery?.demoUrl === 'string'
      ? delivery.demoUrl.trim()
      : ''


  const instructions =
    typeof delivery?.instructions === 'string'
      ? delivery.instructions.trim()
      : ''


  const support =
    typeof delivery?.support === 'string'
      ? delivery.support.trim()
      : ''


  const files =
    Array.isArray(
      delivery?.files,
    )
      ? delivery.files
      : []


  if (
    demoUrl === '' &&
    instructions === '' &&
    support === '' &&
    files.length === 0
  ) {
    const error = new Error(
      'At least one delivery detail is required.',
    )

    error.statusCode = 400

    throw error
  }


  const deliveryData = {
    status:
      'DELIVERED',

    files,

    demoUrl,

    instructions,

    support,

    deliveredAt:
      new Date(),
  }


  const updatedOrder =
    await updateOrderItemDelivery(
      orderId.trim(),
      productId.trim(),
      creatorId.trim(),
      deliveryData,
    )


  if (!updatedOrder) {
    const error = new Error(
      'Order or website item not found, or you are not authorized to provide this delivery.',
    )

    error.statusCode = 404

    throw error
  }


  /*
   * Automatically mark the overall order as
   * DELIVERED only when every website in the
   * order has been delivered.
   */
  const allItemsDelivered =
    Array.isArray(
      updatedOrder.items,
    ) &&
    updatedOrder.items.length > 0 &&
    updatedOrder.items.every(
      (item) =>
        item?.delivery?.status ===
        'DELIVERED',
    )


  if (allItemsDelivered) {
    const completedOrder =
      await updateOrderStatus(
        orderId.trim(),
        'DELIVERED',
      )


    if (completedOrder) {
      return serializeOrder(
        completedOrder,
      )
    }
  }


  return serializeOrder(
    updatedOrder,
  )
}


export async function getOrderDeliveryDownload(
  orderId,
  productId,
  userId,
) {
  if (
    typeof orderId !== 'string' ||
    orderId.trim() === ''
  ) {
    const error = new Error(
      'Order ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  if (
    typeof productId !== 'string' ||
    productId.trim() === ''
  ) {
    const error = new Error(
      'Product ID is required.',
    )

    error.statusCode = 400

    throw error
  }


  const order =
    await getOrderById(
      orderId.trim(),
      userId,
    )


  if (!order) {
    const error = new Error(
      'Order not found.',
    )

    error.statusCode = 404

    throw error
  }


  const item =
    (order.items ?? []).find(
      (orderItem) =>
        orderItem.productId ===
        productId.trim(),
    )


  if (!item) {
    const error = new Error(
      'Website was not found in this order.',
    )

    error.statusCode = 404

    throw error
  }


  const delivery =
    item.delivery ?? {}


  if (
    delivery.status !==
    'DELIVERED'
  ) {
    const error = new Error(
      'Website delivery is not available yet.',
    )

    error.statusCode = 400

    throw error
  }


  /*
   * New Marketplace website delivery:
   *
   * The exact ZIP path was snapshotted into the
   * order item when the buyer placed the order.
   *
   * We use that path instead of requiring the
   * Creator to upload another delivery file.
   */
  if (
    typeof item.websiteZip === 'string' &&
    item.websiteZip.trim() !== ''
  ) {
    const websiteZipPath =
      item.websiteZip.trim()


    /*
     * Only allow the stored Marketplace website
     * ZIP path to resolve inside server/uploads/websites.
     */
    const websitesDirectory =
      path.resolve(
        process.cwd(),
        'server',
        'uploads',
        'websites',
      )


    const safeFileName =
      path.basename(
        websiteZipPath,
      )


    const filePath =
      path.resolve(
        websitesDirectory,
        safeFileName,
      )


    if (
      !filePath.startsWith(
        `${websitesDirectory}${path.sep}`,
      )
    ) {
      const error = new Error(
        'Invalid website delivery file.',
      )

      error.statusCode = 400

      throw error
    }


    if (
      !fs.existsSync(
        filePath,
      )
    ) {
      const error = new Error(
        'Website ZIP file was not found.',
      )

      error.statusCode = 404

      throw error
    }


    return {
      filePath,

      downloadName:
        safeFileName,
    }
  }


  /*
   * Legacy Creator delivery fallback.
   *
   * This remains temporarily so existing orders
   * using the old manual-delivery system continue
   * to work while we transition to automatic
   * Marketplace ZIP delivery.
   */
  const deliveryFile =
    Array.isArray(
      delivery.files,
    ) &&
    delivery.files.length > 0
      ? delivery.files[0]
      : null


  if (
    !deliveryFile?.fileName
  ) {
    const error = new Error(
      'Website delivery file is not available.',
    )

    error.statusCode = 404

    throw error
  }


  const safeFileName =
    path.basename(
      deliveryFile.fileName,
    )


  const filePath =
    path.resolve(
      process.cwd(),
      'server',
      'uploads',
      'deliveries',
      safeFileName,
    )


  if (
    !fs.existsSync(
      filePath,
    )
  ) {
    const error = new Error(
      'Website delivery file was not found.',
    )

    error.statusCode = 404

    throw error
  }


  return {
    filePath,

    downloadName:
      deliveryFile.originalName ||
      safeFileName,
  }
}


function serializeOrder(
  order,
) {
  return {
    id:
      order._id.toString(),

    userId:
      order.userId,

    customer:
      order.customer,

    items:
      order.items,

    totalAmount:
      order.totalAmount,

    status:
      order.status,

    createdAt:
      order.createdAt,

    updatedAt:
      order.updatedAt,
  }
}