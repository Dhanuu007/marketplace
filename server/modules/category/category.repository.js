import { ObjectId } from 'mongodb'

import { getDatabase } from '../../db/mongo.js'


const COLLECTION_NAME = 'categories'


function categoryCollection() {
  return getDatabase().collection(COLLECTION_NAME)
}


let indexesReady = false


async function ensureCategoryIndexes() {
  if (indexesReady) return


  await categoryCollection().createIndex(
    { slug: 1 },
    { unique: true },
  )


  indexesReady = true
}


export async function getCategories() {
  await ensureCategoryIndexes()


  return categoryCollection()
    .find({
      isActive: true,
    })
    .sort({
      name: 1,
    })
    .toArray()
}


export async function getCategoryBySlug(slug) {
  await ensureCategoryIndexes()


  return categoryCollection().findOne({
    slug,
    isActive: true,
  })
}


export async function getCategoryById(categoryId) {
  await ensureCategoryIndexes()


  if (!ObjectId.isValid(categoryId)) {
    return null
  }


  return categoryCollection().findOne({
    _id: new ObjectId(categoryId),
    isActive: true,
  })
}


export async function createCategory(category) {
  await ensureCategoryIndexes()


  const now = new Date()


  const document = {
    ...category,
    createdAt: now,
    updatedAt: now,
  }


  const result = await categoryCollection().insertOne(
    document,
  )


  return categoryCollection().findOne({
    _id: result.insertedId,
  })
}