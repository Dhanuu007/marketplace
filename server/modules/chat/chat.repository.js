import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'

const CONVERSATIONS_COLLECTION = 'conversations'
const MESSAGES_COLLECTION = 'messages'

const SUSPENSION_SUPPORT_TYPE =
  'SUSPENSION_SUPPORT'

const ADMIN_DIRECT_MESSAGE_TYPE =
  'ADMIN_DIRECT_MESSAGE'

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

  const conversations =
    conversationCollection()

  const existingIndexes =
    await conversations.listIndexes().toArray()

  const purchaseIndex =
    existingIndexes.find(
      (index) =>
        index.name ===
        'buyerId_1_creatorId_1_orderId_1_productId_1',
    )

  if (
    purchaseIndex &&
    purchaseIndex.sparse !== true
  ) {
    await conversations.dropIndex(
      'buyerId_1_creatorId_1_orderId_1_productId_1',
    )
  }

  await conversations.createIndex(
    {
      buyerId: 1,
      creatorId: 1,
      orderId: 1,
      productId: 1,
    },
    {
      unique: true,
      sparse: true,
    },
  )

  await conversations.createIndex({
    buyerId: 1,
    updatedAt: -1,
  })

  await conversations.createIndex({
    creatorId: 1,
    updatedAt: -1,
  })

  await conversations.createIndex({
    updatedAt: -1,
  })

  // One direct-message conversation per Admin and recipient.
await conversations.createIndex(
  {
    adminId: 1,
    recipientId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: ADMIN_DIRECT_MESSAGE_TYPE,
    },
    name: 'admin_direct_message_unique',
  },
)

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
 * Create an Admin Direct Message conversation.
 */
export async function createAdminDirectConversation({
  adminId,
  adminName,
  recipientId,
  recipientRole,
  recipientName,
}) {
  await ensureChatIndexes()

  const now = new Date()

  const document = {
    type: ADMIN_DIRECT_MESSAGE_TYPE,

    adminId,
    adminName,

    recipientId,
    recipientRole,
    recipientName,

    lastMessage: '',
    lastMessageAt: null,

    adminUnreadCount: 0,
    recipientUnreadCount: 0,

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
 * Find an existing Admin–recipient conversation.
 */
export async function getAdminDirectConversation(
  adminId,
  recipientId,
) {
  await ensureChatIndexes()

  return conversationCollection().findOne({
    type: ADMIN_DIRECT_MESSAGE_TYPE,
    adminId,
    recipientId,
  })
}

/*
 * Get Admin's direct-message conversations.
 */
export async function getAdminDirectConversationsByAdminId(
  adminId,
) {
  await ensureChatIndexes()

  return conversationCollection()
    .find({
      type: ADMIN_DIRECT_MESSAGE_TYPE,
      adminId,
    })
    .sort({
      updatedAt: -1,
    })
    .toArray()
}

/*
 * Get direct-message conversations for a Buyer or Creator.
 */
export async function getAdminDirectConversationsByRecipientId(
  recipientId,
) {
  await ensureChatIndexes()

  return conversationCollection()
    .find({
      type: ADMIN_DIRECT_MESSAGE_TYPE,
      recipientId,
    })
    .sort({
      updatedAt: -1,
    })
    .toArray()
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
 * Update an Admin Direct Message conversation
 * after a new message.
 */
export async function updateAdminDirectConversationAfterMessage(
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

  if (senderRole === 'ADMIN') {
    update.$inc = {
      recipientUnreadCount: 1,
    }
  } else {
    update.$inc = {
      adminUnreadCount: 1,
    }
  }

  return conversationCollection().findOneAndUpdate(
    {
      _id: new ObjectId(conversationId),
      type: ADMIN_DIRECT_MESSAGE_TYPE,
    },
    update,
    {
      returnDocument: 'after',
    },
  )
}

/*
 * Mark Admin Direct Message messages as read.
 */
export async function markAdminDirectConversationRead(
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
        type: ADMIN_DIRECT_MESSAGE_TYPE,
        ...(isAdmin
          ? { adminId: userId }
          : { recipientId: userId }),
      },
      {
        $set: isAdmin
          ? {
              adminUnreadCount: 0,
              updatedAt: new Date(),
            }
          : {
              recipientUnreadCount: 0,
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