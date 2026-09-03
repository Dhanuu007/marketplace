import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'

const CONVERSATIONS_COLLECTION = 'conversations'
const MESSAGES_COLLECTION = 'messages'

const SUSPENSION_SUPPORT_TYPE =
  'SUSPENSION_SUPPORT'

function conversationCollection() {
  return getDatabase().collection(
    CONVERSATIONS_COLLECTION,
  )
}

function messageCollection() {
  return getDatabase().collection(
    MESSAGES_COLLECTION,
  )
}

let indexesReady = false

async function ensureChatIndexes() {
  if (indexesReady) return

  await conversationCollection().createIndex({
    buyerId: 1,
    creatorId: 1,
    orderId: 1,
    productId: 1,
  }, {
    unique: true,
  })

  await conversationCollection().createIndex({
    buyerId: 1,
    updatedAt: -1,
  })

  await conversationCollection().createIndex({
    creatorId: 1,
    updatedAt: -1,
  })

  await conversationCollection().createIndex({
    updatedAt: -1,
  })

  await messageCollection().createIndex({
    conversationId: 1,
    createdAt: 1,
  })

  await messageCollection().createIndex({
    senderId: 1,
    createdAt: -1,
  })

  indexesReady = true
}


/*
 * Create a new conversation.
 */
export async function createConversation(
  conversation,
) {
  await ensureChatIndexes()

  const now = new Date()

  const document = {
    ...conversation,

    lastMessage: '',
    lastMessageAt: null,

    buyerUnreadCount: 0,
    creatorUnreadCount: 0,

    status: 'OPEN',

    createdAt: now,
    updatedAt: now,
  }

  const result =
    await conversationCollection().insertOne(
      document,
    )

  return conversationCollection().findOne({
    _id: result.insertedId,
  })
}


/*
 * Find an existing conversation for
 * one specific purchase.
 */
export async function getConversationByPurchase(
  buyerId,
  creatorId,
  orderId,
  productId,
) {
  await ensureChatIndexes()

  return conversationCollection().findOne({
    buyerId,
    creatorId,
    orderId,
    productId,
  })
}


/*
 * Get one conversation by ID.
 */
export async function getConversationById(
  conversationId,
) {
  await ensureChatIndexes()

  if (!ObjectId.isValid(conversationId)) {
    return null
  }

  return conversationCollection().findOne({
    _id: new ObjectId(conversationId),
  })
}


/*
 * Get all conversations for a buyer.
 */
export async function getConversationsByBuyerId(
  buyerId,
) {
  await ensureChatIndexes()

  return conversationCollection()
    .find({
      buyerId,
    })
    .sort({
      updatedAt: -1,
    })
    .toArray()
}


/*
 * Get all conversations for a creator.
 */
export async function getConversationsByCreatorId(
  creatorId,
) {
  await ensureChatIndexes()

  return conversationCollection()
    .find({
      creatorId,
    })
    .sort({
      updatedAt: -1,
    })
    .toArray()
}

/*
 * Find the suspension-support conversation
 * for one user.
 */
export async function getSuspensionConversationByUserId(
  userId,
) {
  await ensureChatIndexes()

  return conversationCollection().findOne({
    type: SUSPENSION_SUPPORT_TYPE,
    userId,
  })
}


/*
 * Create a suspension-support conversation.
 */
export async function createSuspensionConversation(
  userId,
  userRole,
  userName,
) {
  await ensureChatIndexes()

  const now = new Date()

  const document = {
    type: SUSPENSION_SUPPORT_TYPE,

    userId,
    userRole,
    userName,

    lastMessage: '',
    lastMessageAt: null,

    userUnreadCount: 0,
    adminUnreadCount: 0,

    status: 'OPEN',

    createdAt: now,
    updatedAt: now,
  }

  const result =
    await conversationCollection().insertOne(
      document,
    )

  return conversationCollection().findOne({
    _id: result.insertedId,
  })
}


/*
 * Get all suspension-support conversations
 * for Admin.
 */
export async function getSuspensionConversations() {
  await ensureChatIndexes()

  return conversationCollection()
    .find({
      type: SUSPENSION_SUPPORT_TYPE,
    })
    .sort({
      updatedAt: -1,
    })
    .toArray()
}


/*
 * Update a suspension conversation after
 * a new message.
 */
export async function updateSuspensionConversationAfterMessage(
  conversationId,
  lastMessage,
  senderRole,
) {
  await ensureChatIndexes()

  if (!ObjectId.isValid(conversationId)) {
    return null
  }

  const update = {
    $set: {
      lastMessage,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    },
  }

  if (
      senderRole === 'BUYER' ||
      senderRole === 'CREATOR'
    ) {
      update.$inc = {
        adminUnreadCount: 1,
      }
    }

    if (senderRole === 'ADMIN') {
      update.$inc = {
        userUnreadCount: 1,
      }
    }

  return conversationCollection().findOneAndUpdate(
    {
      _id: new ObjectId(conversationId),
      type: SUSPENSION_SUPPORT_TYPE,
    },
    update,
    {
      returnDocument: 'after',
    },
  )
}


/*
 * Mark a suspension-support conversation
 * as read for the current participant.
 */
export async function markSuspensionConversationRead(
  conversationId,
  userId,
  isAdmin,
) {
  await ensureChatIndexes()

  if (!ObjectId.isValid(conversationId)) {
    return null
  }

  const conversation =
    await conversationCollection().findOneAndUpdate(
      {
        _id: new ObjectId(conversationId),
        type: SUSPENSION_SUPPORT_TYPE,
        ...(isAdmin
          ? {}
          : { userId }),
      },
      {
        $set: isAdmin
          ? {
              adminUnreadCount: 0,
              updatedAt: new Date(),
            }
          : {
              userUnreadCount: 0,
              updatedAt: new Date(),
            },
      },
      {
        returnDocument: 'after',
      },
    )

  if (!conversation) {
    return null
  }

  await messageCollection().updateMany(
    {
      conversationId,
      readBy: {
        $ne: userId,
      },
    },
    {
      $addToSet: {
        readBy: userId,
      },
    },
  )

  return conversation
}


/*
 * Get all conversations for Admin.
 */
export async function getAllConversations() {
  await ensureChatIndexes()

  return conversationCollection()
    .find({})
    .sort({
      updatedAt: -1,
    })
    .toArray()
}


/*
 * Add a message to a conversation.
 */
export async function createMessage(
  message,
) {
  await ensureChatIndexes()

  const now = new Date()

  const document = {
    ...message,

    readBy: [
      message.senderId,
    ],

    createdAt: now,
    updatedAt: now,
  }

  const result =
    await messageCollection().insertOne(
      document,
    )

  return messageCollection().findOne({
    _id: result.insertedId,
  })
}


/*
 * Get messages for one conversation.
 */
export async function getMessagesByConversationId(
  conversationId,
) {
  await ensureChatIndexes()

  if (!ObjectId.isValid(conversationId)) {
    return []
  }

  return messageCollection()
    .find({
      conversationId,
    })
    .sort({
      createdAt: 1,
    })
    .toArray()
}


/*
 * Update conversation after a new message.
 */
export async function updateConversationAfterMessage(
  conversationId,
  lastMessage,
  senderRole,
) {
  await ensureChatIndexes()

  if (!ObjectId.isValid(conversationId)) {
    return null
  }

  const update = {
    $set: {
      lastMessage,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    },
  }

  if (senderRole === 'BUYER') {
    update.$inc = {
      creatorUnreadCount: 1,
    }
  }

  if (senderRole === 'CREATOR') {
    update.$inc = {
      buyerUnreadCount: 1,
    }
  }

  return conversationCollection().findOneAndUpdate(
    {
      _id: new ObjectId(conversationId),
    },
    update,
    {
      returnDocument: 'after',
    },
  )
}


/*
 * Mark messages as read for the current user.
 */
export async function markConversationRead(
  conversationId,
  userId,
  role,
) {
  await ensureChatIndexes()

  if (!ObjectId.isValid(conversationId)) {
    return null
  }

  const conversation =
    await conversationCollection().findOneAndUpdate(
      {
        _id: new ObjectId(conversationId),
      },
      {
        $set:
          role === 'BUYER'
            ? {
                buyerUnreadCount: 0,
                updatedAt: new Date(),
              }
            : {
                creatorUnreadCount: 0,
                updatedAt: new Date(),
              },
      },
      {
        returnDocument: 'after',
      },
    )

  if (!conversation) {
    return null
  }

  await messageCollection().updateMany(
    {
      conversationId,
      readBy: {
        $ne: userId,
      },
    },
    {
      $addToSet: {
        readBy: userId,
      },
    },
  )

  return conversation
}


/*
 * Close a conversation.
 */
export async function closeConversation(
  conversationId,
) {
  await ensureChatIndexes()

  if (!ObjectId.isValid(conversationId)) {
    return null
  }

  return conversationCollection().findOneAndUpdate(
    {
      _id: new ObjectId(conversationId),
    },
    {
      $set: {
        status: 'CLOSED',
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
    },
  )
}