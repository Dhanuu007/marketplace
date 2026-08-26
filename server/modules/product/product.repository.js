import { ObjectId } from 'mongodb'


import { getDatabase } from '../../db/mongo.js'



const COLLECTION_NAME = 'products'



function productCollection() {

  return getDatabase().collection(COLLECTION_NAME)

}



let indexesReady = false



async function ensureProductIndexes() {

  if (indexesReady) return


  await productCollection().createIndex(

    { slug: 1 },

    { unique: true },

  )


  await productCollection().createIndex({

    categoryId: 1,

  })


  await productCollection().createIndex({

    isActive: 1,

  })


  await productCollection().createIndex({

    creatorId: 1,

  })


  await productCollection().createIndex({

    approvalStatus: 1,

  })


  indexesReady = true

}



export async function getProducts() {

  await ensureProductIndexes()

  return productCollection()

    .find({

      isActive: true,

      approvalStatus: 'APPROVED',

    })

    .sort({

      createdAt: -1,

    })

    .toArray()

}



export async function getAllProductsForAdmin() {

  await ensureProductIndexes()


  return productCollection()

    .find({})

    .sort({

      createdAt: -1,

    })

    .toArray()

}



export async function getProductById(productId) {

  await ensureProductIndexes()


  if (!ObjectId.isValid(productId)) {

    return null

  }


  return productCollection().findOne({

    _id: new ObjectId(productId),

    isActive: true,

    approvalStatus: 'APPROVED',

  })

}



export async function getProductsByCategory(categoryId) {

  await ensureProductIndexes()


  return productCollection()

    .find({

      categoryId,

      isActive: true,

      approvalStatus: 'APPROVED',

    })

    .sort({

      createdAt: -1,

    })

    .toArray()

}



export async function getProductsForCreator(creatorId) {

  await ensureProductIndexes()


  return productCollection()

    .find({

      creatorId,

      approvalStatus: {

        $ne: 'DELETED',

      },

    })

    .sort({

      createdAt: -1,

    })

    .toArray()

}



export async function getProductForCreator(

  productId,

  creatorId,

) {

  await ensureProductIndexes()


  if (!ObjectId.isValid(productId)) {

    return null

  }


  return productCollection().findOne({

    _id: new ObjectId(productId),

    creatorId,

    approvalStatus: {

      $ne: 'DELETED',

    },

  })

}



export async function createProduct(product) {

  await ensureProductIndexes()


  const now = new Date()


  const document = {

    ...product,

    createdAt: now,

    updatedAt: now,

  }


  const result = await productCollection().insertOne(

    document,

  )


  return productCollection().findOne({

    _id: result.insertedId,

  })

}



export async function updateProductForCreator(

  productId,

  creatorId,

  updates,

) {

  await ensureProductIndexes()


  if (!ObjectId.isValid(productId)) {

    return null

  }


  const result = await productCollection().findOneAndUpdate(

    {

      _id: new ObjectId(productId),

      creatorId,

      approvalStatus: {

        $ne: 'DELETED',

      },

    },

    {

      $set: {

        ...updates,

        updatedAt: new Date(),

      },

    },

    {

      returnDocument: 'after',

    },

  )


  return result

}



export async function updateProductApproval(

  productId,

  approvalStatus,

  isActive,

) {

  await ensureProductIndexes()


  if (!ObjectId.isValid(productId)) {

    return null

  }


  const result = await productCollection().findOneAndUpdate(

    {

      _id: new ObjectId(productId),

    },

    {

      $set: {

        approvalStatus,

        isActive,

        updatedAt: new Date(),

      },

    },

    {

      returnDocument: 'after',

    },

  )


  return result

}



export async function deleteProduct(

  productId,

) {

  await ensureProductIndexes()


  if (!ObjectId.isValid(productId)) {

    return null

  }


  const result = await productCollection().findOneAndUpdate(

    {

      _id: new ObjectId(productId),

      approvalStatus: 'APPROVED',

      isActive: true,

    },

    {

      $set: {

        approvalStatus: 'DELETED',

        isActive: false,

        updatedAt: new Date(),

      },

    },

    {

      returnDocument: 'after',

    },

  )


  return result

}



export async function relistProduct(

  productId,

) {

  await ensureProductIndexes()


  if (!ObjectId.isValid(productId)) {

    return null

  }


  const result = await productCollection().findOneAndUpdate(

    {

      _id: new ObjectId(productId),

      approvalStatus: 'DELETED',

    },

    {

      $set: {

        approvalStatus: 'APPROVED',

        isActive: true,

        updatedAt: new Date(),

      },

    },

    {

      returnDocument: 'after',

    },

  )


  return result

}



export async function assignProductToCreator(

  productId,

  creatorId,

  creatorName,

) {

  await ensureProductIndexes()


  if (!ObjectId.isValid(productId)) {

    return null

  }


  const result = await productCollection().findOneAndUpdate(

    {

      _id: new ObjectId(productId),

    },

    {

      $set: {

        creatorId,

        creatorName,

        updatedAt: new Date(),

      },

    },

    {

      returnDocument: 'after',

    },

  )


  return result

}