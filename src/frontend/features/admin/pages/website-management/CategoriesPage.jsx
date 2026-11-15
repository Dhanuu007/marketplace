
import { useEffect, useState } from 'react'

import { AdminLayout } from '../../components/AdminLayout.jsx'
import { useAuth } from '../../../auth/useAuth.js'
import { apiRequest } from '../../../../../services/apiClient.js'

import './CategoriesPage.css'

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  image: '',
  isActive: true,
}

function CategoriesPage() {
  const { token } = useAuth()

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState(EMPTY_FORM)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadCategories() {
    try {
      setError('')

      const data = await apiRequest('/categories', {
        method: 'GET',
        token,
      })

      setCategories(
        Array.isArray(data?.categories)
          ? data.categories
          : [],
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Failed to load categories.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  if (!token) return

  let cancelled = false

  async function fetchCategories() {
    try {
      const data = await apiRequest('/categories', {
        method: 'GET',
        token,
      })

      if (!cancelled) {
        setCategories(
          Array.isArray(data?.categories)
            ? data.categories
            : [],
        )
      }
    } catch (requestError) {
      if (!cancelled) {
        setError(
          requestError?.message ||
            'Failed to load categories.',
        )
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  fetchCategories()

  return () => {
    cancelled = true
  }
}, [token])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      }

      if (name === 'name') {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }

      return updated
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      const data = await apiRequest('/categories', {
        method: 'POST',
        token,
        body: formData,
      })

      if (data?.category) {
        setCategories((previous) => [
          ...previous,
          data.category,
        ])
      } else {
        await loadCategories()
      }

      setFormData(EMPTY_FORM)
      setSuccess('Category created successfully.')
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Failed to create category.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page categories-admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Categories</h1>
            <p>
              Manage marketplace website categories.
            </p>
          </div>
        </div>

        <div className="categories-admin-grid">
          <section className="categories-admin-panel">
            <h2>Add New Category</h2>

            <form onSubmit={handleSubmit}>
              <div className="categories-form-group">
                <label>Category Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enterprise HR Tech"
                  required
                />
              </div>

              <div className="categories-form-group">
                <label>Category Slug</label>
                <input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="categories-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe this category..."
                  required
                  rows={4}
                />
              </div>

              <div className="categories-form-group">
                <label>Category Image URL</label>
                <input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <label className="categories-active-toggle">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Active category
              </label>

              <button
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? 'Creating...'
                  : 'Create Category'}
              </button>
            </form>

            {error && (
              <p className="categories-error">{error}</p>
            )}

            {success && (
              <p className="categories-success">{success}</p>
            )}
          </section>

          <section className="categories-admin-panel">
            <h2>Existing Categories</h2>

            {loading ? (
              <p>Loading categories...</p>
            ) : categories.length === 0 ? (
              <p>No active categories found.</p>
            ) : (
              <div className="categories-admin-list">
                {categories.map((category) => (
                  <div
                    className="categories-admin-item"
                    key={category._id}
                  >
                    <div>
                      <strong>{category.name}</strong>
                      <span>{category.slug}</span>
                    </div>
                    <span className="categories-active-badge">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}

export default CategoriesPage
