import {
  getCategories,
  getCategoryBySlug,
  createCategory,
} from './category.repository.js'


export async function getAllCategories() {
  return getCategories()
}


export async function getSingleCategory(slug) {
  return getCategoryBySlug(slug)
}


export async function addCategory(input) {
  return createCategory({
    name: input.name,
    slug: input.slug,
    description: input.description,
    image: input.image,
    isActive: input.isActive,
  })
}