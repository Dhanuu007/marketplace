import {
  getOrderById,
} from '../order/order.repository.js'

import {
  createChatMessageNotification,
} from '../notification/notification.service.js'

import {
  createConversation,
  getConversationByPurchase,
  getConversationById,
  getConversationsByBuyerId,
  getConversationsByCreatorId,
  getAllConversations,
  createMessage,
  getMessagesByConversationId,
  updateConversationAfterMessage,
  markConversationRead,
  closeConversation,
} from './chat.repository.js'


const CHAT_ELIGIBLE_ORDER_STATUSES = [
  'PAID',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
]


function createError(
  statusCode,
  message,
) {
  const error = new Error(message)

  error.statusCode = statusCode

  return error
}


/*
 * Find and verify a purchased product
 * belonging to the current buyer.
 *
 * IMPORTANT:
 * The creatorId is NEVER taken from the
 * buyer's request.
 *
 * It comes from the trusted order item.
 */
async function getPurchasedItem(
  buyerId,
  orderId,
  productId,
) {
  const order = await getOrderById(
    orderId,
    buyerId,
  )

  if (!order) {
    throw createError(
      404,
      'Order not found.',
    )
  }


  if (
    !CHAT_ELIGIBLE_ORDER_STATUSES.includes(
      order.status,
    )
  ) {
    throw createError(
      400,
      'Chat is available only for completed purchases.',
    )
  }


  const item =
    (order.items ?? []).find(
      (orderItem) =>
        orderItem.productId ===
        productId,
    )


  if (!item) {
    throw createError(
      404,
      'Product was not found in this order.',
    )
  }


  if (
    typeof item.creatorId !== 'string' ||
    item.creatorId.trim() === ''
  ) {
    throw createError(
      400,
      'This purchased product is not linked to a creator.',
    )
  }


  return {
    order,
    item,
    creatorId: item.creatorId,
  }
}


/*
 * Create or return the conversation for
 * one purchased product.
 *
 * Buyer supplies only:
 * orderId + productId.
 *
 * creatorId comes from the trusted order.
 */
export async function createOrGetBuyerConversation(
  buyerId,
  orderId,
  productId,
) {
  const {
    order,
    item,
    creatorId,
  } = await getPurchasedItem(
    buyerId,
    orderId,
    productId,
  )


  let conversation =
    await getConversationByPurchase(
      buyerId,
      creatorId,
      order._id.toString(),
      productId,
    )


  if (!conversation) {
    conversation =
      await createConversation({
        buyerId,

        creatorId,

        orderId:
          order._id.toString(),

        productId,

        productName:
          item.name ?? '',

        creatorName:
          item.creatorName ?? '',
      })
  }


  return serializeConversation(
    conversation,
  )
}


/*
 * Get conversations for the current buyer.
 */
export async function getBuyerConversations(
  buyerId,
) {
  const conversations =
    await getConversationsByBuyerId(
      buyerId,
    )

  return conversations.map(
    serializeConversation,
  )
}


/*
 * Get conversations for the current creator.
 */
export async function getCreatorConversations(
  creatorId,
) {
  const conversations =
    await getConversationsByCreatorId(
      creatorId,
    )

  return conversations.map(
    serializeConversation,
  )
}


/*
 * Get all conversations for Admin.
 */
export async function getAdminConversations() {
  const conversations =
    await getAllConversations()

  return conversations.map(
    serializeConversation,
  )
}


/*
 * Verify that the current user is allowed
 * to access a conversation.
 */
async function getAuthorizedConversation(
  conversationId,
  user,
) {
  const conversation =
    await getConversationById(
      conversationId,
    )


  if (!conversation) {
    throw createError(
      404,
      'Conversation not found.',
    )
  }


  if (user.role === 'ADMIN') {
    return conversation
  }


  if (
    user.role === 'BUYER' &&
    conversation.buyerId ===
      user.id
  ) {
    return conversation
  }


  if (
    user.role === 'CREATOR' &&
    conversation.creatorId ===
      user.id
  ) {
    return conversation
  }


  throw createError(
    403,
    'You do not have access to this conversation.',
  )
}


/*
 * Get one conversation with its messages.
 */
export async function getConversationWithMessages(
  conversationId,
  user,
) {
  const conversation =
    await getAuthorizedConversation(
      conversationId,
      user,
    )


  const messages =
    await getMessagesByConversationId(
      conversationId,
    )


  return {
    conversation:
      serializeConversation(
        conversation,
      ),

    messages:
      messages.map(
        serializeMessage,
      ),
  }
}


/*
 * Send a message.
 */
export async function sendConversationMessage(
  conversationId,
  user,
  text,
) {
  const conversation =
    await getAuthorizedConversation(
      conversationId,
      user,
    )


  if (
    conversation.status ===
    'CLOSED'
  ) {
    throw createError(
      400,
      'This conversation is closed.',
    )
  }


  /*
   * Admin can currently read conversations,
   * but the first version does not allow Admin
   * to send messages.
   */
  if (
    user.role === 'ADMIN'
  ) {
    throw createError(
      403,
      'Admin messaging is not enabled yet.',
    )
  }


  const senderRole =
    user.role === 'BUYER'
      ? 'BUYER'
      : 'CREATOR'


  const message =
    await createMessage({
      conversationId,

      senderId:
        user.id,

      senderRole,

      text,
    })


  const updatedConversation =
    await updateConversationAfterMessage(
      conversationId,
      text,
      senderRole,
    )


  /*
   * Create a notification for the OTHER
   * participant in the conversation.
   *
   * BUYER sends  → CREATOR notified
   * CREATOR sends → BUYER notified
   *
   * The notification service determines
   * the recipient from the conversation.
   */
  await createChatMessageNotification({
    conversation:
      updatedConversation,

    sender: user,
  })


  return {
    message:
      serializeMessage(
        message,
      ),

    conversation:
      serializeConversation(
        updatedConversation,
      ),
  }
}


/*
 * Mark a conversation as read.
 */
export async function markConversationAsRead(
  conversationId,
  user,
) {
  const conversation =
    await getAuthorizedConversation(
      conversationId,
      user,
    )


  if (
    user.role === 'ADMIN'
  ) {
    return serializeConversation(
      conversation,
    )
  }


  const role =
    user.role === 'BUYER'
      ? 'BUYER'
      : 'CREATOR'


  const updatedConversation =
    await markConversationRead(
      conversationId,
      user.id,
      role,
    )


  return serializeConversation(
    updatedConversation,
  )
}


/*
 * Close a conversation.
 *
 * For now this is intended for Admin.
 */
export async function closeChatConversation(
  conversationId,
) {
  const conversation =
    await closeConversation(
      conversationId,
    )


  if (!conversation) {
    throw createError(
      404,
      'Conversation not found.',
    )
  }


  return serializeConversation(
    conversation,
  )
}


function serializeConversation(
  conversation,
) {
  return {
    id:
      conversation._id.toString(),

    buyerId:
      conversation.buyerId,

    creatorId:
      conversation.creatorId,

    orderId:
      conversation.orderId,

    productId:
      conversation.productId,

    productName:
      conversation.productName ?? '',

    creatorName:
      conversation.creatorName ?? '',

    lastMessage:
      conversation.lastMessage ?? '',

    lastMessageAt:
      conversation.lastMessageAt,

    buyerUnreadCount:
      conversation.buyerUnreadCount ?? 0,

    creatorUnreadCount:
      conversation.creatorUnreadCount ?? 0,

    status:
      conversation.status,

    createdAt:
      conversation.createdAt,

    updatedAt:
      conversation.updatedAt,
  }
}


function serializeMessage(
  message,
) {
  return {
    id:
      message._id.toString(),

    conversationId:
      message.conversationId,

    senderId:
      message.senderId,

    senderRole:
      message.senderRole,

    text:
      message.text,

    readBy:
      message.readBy ?? [],

    createdAt:
      message.createdAt,

    updatedAt:
      message.updatedAt,
  }
}