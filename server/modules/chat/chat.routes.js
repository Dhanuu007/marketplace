import { Router } from 'express'

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js'

import {
  createOrGetBuyerConversation,
  getBuyerConversations,
  getCreatorConversations,
  getAdminConversations,
  getConversationWithMessages,
  sendConversationMessage,
  markConversationAsRead,
  closeChatConversation,
} from './chat.service.js'

import {
  validateCreateConversation,
  validateSendMessage,
} from './chat.validation.js'


const router = Router()


/*
 * Buyer: create or open a chat for
 * a purchased product.
 */
router.post(
  '/chat/conversations',
  requireAuth,
  requireRole('BUYER'),
  async (request, response, next) => {
    try {
      const input =
        validateCreateConversation(
          request.body,
        )

      const conversation =
        await createOrGetBuyerConversation(
          request.user.id,
          input.orderId,
          input.productId,
        )

      response.status(201).json({
        conversation,
      })
    } catch (error) {
      next(error)
    }
  },
)


/*
 * Buyer: get all conversations.
 */
router.get(
  '/chat/conversations',
  requireAuth,
  requireRole('BUYER'),
  async (request, response, next) => {
    try {
      const conversations =
        await getBuyerConversations(
          request.user.id,
        )

      response.json({
        conversations,
      })
    } catch (error) {
      next(error)
    }
  },
)


/*
 * Creator: get conversations belonging
 * to their products.
 */
router.get(
  '/creator/chat/conversations',
  requireAuth,
  requireRole('CREATOR'),
  async (request, response, next) => {
    try {
      const conversations =
        await getCreatorConversations(
          request.user.id,
        )

      response.json({
        conversations,
      })
    } catch (error) {
      next(error)
    }
  },
)


/*
 * Admin: get every conversation.
 */
router.get(
  '/admin/chat/conversations',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const conversations =
        await getAdminConversations()

      response.json({
        conversations,
      })
    } catch (error) {
      next(error)
    }
  },
)


/*
 * Buyer / Creator / Admin:
 * get one conversation with messages.
 */
router.get(
  '/chat/conversations/:conversationId',
  requireAuth,
  async (request, response, next) => {
    try {
      const result =
        await getConversationWithMessages(
          request.params.conversationId,
          request.user,
        )

      response.json(result)
    } catch (error) {
      next(error)
    }
  },
)


/*
 * Buyer / Creator:
 * send a message.
 */
router.post(
  '/chat/conversations/:conversationId/messages',
  requireAuth,
  async (request, response, next) => {
    try {
      const input =
        validateSendMessage(
          request.body,
        )

      const result =
        await sendConversationMessage(
          request.params.conversationId,
          request.user,
          input.text,
        )

      response.status(201).json(result)
    } catch (error) {
      next(error)
    }
  },
)


/*
 * Buyer / Creator:
 * mark messages as read.
 */
router.patch(
  '/chat/conversations/:conversationId/read',
  requireAuth,
  async (request, response, next) => {
    try {
      const conversation =
        await markConversationAsRead(
          request.params.conversationId,
          request.user,
        )

      response.json({
        conversation,
      })
    } catch (error) {
      next(error)
    }
  },
)


/*
 * Admin: close a conversation.
 */
router.patch(
  '/admin/chat/conversations/:conversationId/close',
  requireAuth,
  requireRole('ADMIN'),
  async (request, response, next) => {
    try {
      const conversation =
        await closeChatConversation(
          request.params.conversationId,
        )

      response.json({
        conversation,
      })
    } catch (error) {
      next(error)
    }
  },
)


export default router