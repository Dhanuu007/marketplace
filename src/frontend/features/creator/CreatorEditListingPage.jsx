import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import { env } from '../../config/env.js'

import './CreatorEditListingPage.css'


const API_ORIGIN =
  env.apiBaseUrl.replace(/\/api\/?$/, '')


export function CreatorEditListingPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { productId } = useParams()

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
  name: '',
  description: '',
  categoryId: '',
  price: '',
  demoUrl: '',
  technology: '',
  approvalStatus: 'PENDING',
})

  const [existingScreenshots, setExistingScreenshots] =
    useState([])

  const [newScreenshots, setNewScreenshots] = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!auth.token || !productId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const [productData, categoryData] =
  await Promise.all([
    apiRequest(`/products/creator/${productId}`, {
      method: 'GET',
      token: auth.token,
    }),
    apiRequest('/categories', {
      method: 'GET',
      token: auth.token,
    }),
  ])

        const product = productData?.product

        if (!product) {
          throw new Error('Website listing not found.')
        }

        if (isMounted) {
          setForm({
            name: product.name || '',
            description: product.description || '',
            categoryId: product.categoryId || '',
            price: product.price ?? '',
            demoUrl: product.demoUrl || '',
            technology: product.technology || '',
            approvalStatus:
              product.approvalStatus || 'PENDING',
          })

          setExistingScreenshots(
            Array.isArray(product.screenshots)
              ? product.screenshots
              : [],
          )

          setCategories(
            Array.isArray(categoryData.categories)
              ? categoryData.categories
              : [],
          )
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.message ||
              'Unable to load website listing.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setCategoriesLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [auth.token, productId])


  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }


  function handleNewScreenshotChange(event) {
    const selectedFiles = Array.from(
      event.target.files || [],
    )

    const totalScreenshots =
      existingScreenshots.length +
      selectedFiles.length

    if (totalScreenshots > 5) {
      setError(
        'A listing can have a maximum of 5 screenshots.',
      )

      setNewScreenshots(
        selectedFiles.slice(
          0,
          Math.max(0, 5 - existingScreenshots.length),
        ),
      )

      return
    }

    setError('')
    setNewScreenshots(selectedFiles)
  }


  function removeExistingScreenshot(index) {
    setExistingScreenshots((currentScreenshots) =>
      currentScreenshots.filter(
        (_, screenshotIndex) =>
          screenshotIndex !== index,
      ),
    )
  }


  function getScreenshotUrl(path) {
    if (!path) {
      return ''
    }

    if (
      path.startsWith('http://') ||
      path.startsWith('https://')
    ) {
      return path
    }

    return `${API_ORIGIN}${path}`
  }


  async function handleSubmit(event) {
    event.preventDefault()

    if (!auth.token) {
      setError('You must be logged in as a Creator.')
      return
    }

    if (!productId) {
      setError('Website listing ID is missing.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const formData = new FormData()

      formData.append(
        'name',
        form.name,
      )

      formData.append(
        'slug',
        createSlug(form.name),
      )

      formData.append(
        'description',
        form.description,
      )

      formData.append(
        'price',
        String(Number(form.price)),
      )

      formData.append(
        'image',
        '',
      )

      formData.append(
        'categoryId',
        form.categoryId,
      )

      formData.append(
        'demoUrl',
        form.demoUrl,
      )

      formData.append(
        'technology',
        form.technology,
      )

      existingScreenshots.forEach(
        (screenshot) => {
          formData.append(
            'existingScreenshots',
            screenshot,
          )
        },
      )

      newScreenshots.forEach((file) => {
        formData.append(
          'screenshots',
          file,
        )
      })

      await apiRequest(
        `/products/creator/${productId}`,
        {
          method: 'PATCH',
          token: auth.token,
          body: formData,
        },
      )

      navigate('/creator/dashboard')
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to update your website listing.',
      )
    } finally {
      setSubmitting(false)
    }
  }


  function createSlug(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }


  if (loading) {
    return (
      <main className="creator-edit-shell">
        <section className="creator-edit-container">

          <div className="creator-edit-loading">
            Loading website listing...
          </div>

        </section>
      </main>
    )
  }


  return (
    <main className="creator-edit-shell">
      <section className="creator-edit-container">

        <div className="creator-edit-header">

          <Link
            to="/creator/dashboard"
            className="creator-edit-back-link"
          >
            Back to Dashboard
          </Link>

          <p className="eyebrow">
            Website Creator
          </p>

          <h1>
            Edit Website Listing
          </h1>

          <p className="creator-edit-intro">
            Update your website information, technology,
            demo URL, price, and screenshots.
          </p>

        </div>


        <form
          className="creator-edit-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <div className="creator-edit-error">
              {error}
            </div>
          )}


          <label>
            <span>
              Website Name
            </span>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>


          <label>
            <span>
              Description
            </span>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="6"
              required
            />
          </label>


          <label>
            <span>
              Website Category
            </span>

            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              disabled={categoriesLoading}
              required
            >
              <option value="">
                {categoriesLoading
                  ? 'Loading categories...'
                  : 'Select a category'}
              </option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>


          <label>
            <span>
              Demo URL
            </span>

            <input
              type="url"
              name="demoUrl"
              value={form.demoUrl}
              onChange={handleChange}
              required
            />
          </label>


          <label>
            <span>
              Technology
            </span>

            <input
              type="text"
              name="technology"
              value={form.technology}
              onChange={handleChange}
              required
            />
          </label>


          <section className="creator-edit-screenshots">

            <div className="creator-edit-screenshots-heading">
              <span>
                Website Screenshots
              </span>

              <small>
                Keep or remove existing screenshots and add
                new ones. Maximum 5 total.
              </small>
            </div>


            {existingScreenshots.length > 0 && (
              <div className="creator-edit-existing-grid">

                {existingScreenshots.map(
                  (screenshot, index) => (
                    <div
                      key={`${screenshot}-${index}`}
                      className="creator-edit-screenshot-card"
                    >

                      <img
                        src={getScreenshotUrl(
                          screenshot,
                        )}
                        alt={`Website screenshot ${index + 1}`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingScreenshot(
                            index,
                          )
                        }
                        className="creator-remove-screenshot"
                      >
                        Remove
                      </button>

                    </div>
                  ),
                )}

              </div>
            )}


            <label className="creator-edit-upload">

              <span>
                Add New Screenshots
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleNewScreenshotChange}
              />

            </label>


            {newScreenshots.length > 0 && (
              <div className="creator-new-screenshot-list">

                {newScreenshots.map((file) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className="creator-new-screenshot-item"
                  >
                    {file.name}
                  </div>
                ))}

              </div>
            )}

          </section>


          <label>
            <span>
              Price
            </span>

                            <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      required
                      disabled={form.approvalStatus === 'APPROVED'}
                    />

                  {form.approvalStatus === 'APPROVED' && (
                    <small>
                     Price is locked because this website listing
                      has already been approved by the administrator.
                    </small>
                    )}
          </label>


          <div className="creator-edit-actions">

            <Link
              to="/creator/dashboard"
              className="creator-edit-secondary-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="creator-edit-submit-button"
              disabled={submitting}
            >
              {submitting
                ? 'Saving Changes...'
                : 'Save Changes'}
            </button>

          </div>

        </form>

      </section>
    </main>
  )
}
