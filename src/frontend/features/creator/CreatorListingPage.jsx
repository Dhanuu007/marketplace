import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './CreatorListingPage.css'


export function CreatorListingPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    demoUrl: '',
    technology: '',
  })

  const [screenshots, setScreenshots] = useState([])
  const [websiteZip, setWebsiteZip] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      try {
        setCategoriesLoading(true)
        setError('')

        const data = await apiRequest('/categories', {
          method: 'GET',
          token: auth.token,
        })

        if (isMounted) {
          setCategories(
            Array.isArray(data.categories)
              ? data.categories
              : [],
          )
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.message ||
              'Unable to load website categories.',
          )
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [auth.token])


  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }


  function handleScreenshotChange(event) {
    const selectedFiles = Array.from(
      event.target.files || [],
    )

    if (selectedFiles.length > 5) {
      setError(
        'You can select a maximum of 5 screenshots.',
      )

      setScreenshots(
        selectedFiles.slice(0, 5),
      )

      return
    }

    setError('')
    setScreenshots(selectedFiles)
  }


  function handleWebsiteZipChange(event) {
    const selectedFile =
      event.target.files?.[0] ?? null

    if (!selectedFile) {
      setWebsiteZip(null)
      return
    }


    const maxZipSize =
      500 * 1024 * 1024


    const extension = selectedFile.name
      .split('.')
      .pop()
      ?.toLowerCase()


    if (extension !== 'zip') {
      setError(
        'Only ZIP files are allowed for the website upload.',
      )

      setWebsiteZip(null)
      event.target.value = ''

      return
    }


    if (selectedFile.size > maxZipSize) {
      setError(
        'The website ZIP file must be 500 MB or smaller.',
      )

      setWebsiteZip(null)
      event.target.value = ''

      return
    }


    setError('')
    setWebsiteZip(selectedFile)
  }


  async function handleSubmit(event) {
    event.preventDefault()

    if (!auth.token) {
      setError('You must be logged in as a Creator.')
      return
    }


    if (!websiteZip) {
      setError(
        'Please select the ready-made website ZIP file.',
      )

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


      screenshots.forEach((file) => {
        formData.append(
          'screenshots',
          file,
        )
      })


      formData.append(
        'websiteZip',
        websiteZip,
      )


      await apiRequest('/products/creator', {
        method: 'POST',
        token: auth.token,
        body: formData,
      })


      navigate('/creator/dashboard')
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to submit your website listing.',
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


  return (
    <main className="creator-listing-shell">

      <section className="creator-listing-container">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <header className="creator-listing-header">

          <Link
            to="/creator/dashboard"
            className="creator-back-link"
          >
            <span aria-hidden="true">
              ←
            </span>

            Back to Dashboard
          </Link>


          <div className="creator-listing-title-row">

            <div>

              <p className="eyebrow">
                Website Creator
              </p>

              <h1>
                Add Website Listing
              </h1>

              <p className="creator-listing-intro">
                Showcase your website on the Marketplace
                and let buyers discover and purchase it.
              </p>

            </div>


            <div className="creator-listing-header-badge">
              <span className="creator-listing-header-dot" />
              New Listing
            </div>

          </div>

        </header>


        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          className="creator-listing-form"
          onSubmit={handleSubmit}
        >

          {/* FORM INTRO */}

          <div className="creator-form-intro">

            <div className="creator-form-intro-icon">
              +
            </div>

            <div>
              <h2>
                Website Information
              </h2>

              <p>
                Add the important details buyers need
                before purchasing your website.
              </p>
            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div
              className="creator-listing-error"
              role="alert"
            >
              <span
                className="creator-error-icon"
                aria-hidden="true"
              >
                !
              </span>

              <span>
                {error}
              </span>
            </div>
          )}


          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="creator-form-section">

            <div className="creator-form-section-heading">

              <span className="creator-form-step">
                01
              </span>

              <div>
                <h3>
                  Basic Information
                </h3>

                <p>
                  Tell buyers what your website is about.
                </p>
              </div>

            </div>


            <div className="creator-form-grid">

              <label className="creator-field creator-field-full">

                <span>
                  Website Name
                  <b>*</b>
                </span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Modern Restaurant Website"
                  required
                />

                <small>
                  Choose a clear and memorable name.
                </small>

              </label>


              <label className="creator-field creator-field-full">

                <span>
                  Description
                  <b>*</b>
                </span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the website, its purpose, design, features, and what makes it valuable to buyers."
                  rows={7}
                  required
                />

                <small>
                  Give buyers enough information to understand
                  what they are purchasing.
                </small>

              </label>

            </div>

          </div>


          {/* =================================================
              WEBSITE DETAILS
          ================================================= */}

          <div className="creator-form-section">

            <div className="creator-form-section-heading">

              <span className="creator-form-step">
                02
              </span>

              <div>
                <h3>
                  Website Details
                </h3>

                <p>
                  Help buyers understand the technology and
                  category of your website.
                </p>
              </div>

            </div>


            <div className="creator-form-grid">

              <label className="creator-field">

                <span>
                  Website Category
                  <b>*</b>
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


              <label className="creator-field">

                <span>
                  Technology
                  <b>*</b>
                </span>

                <input
                  type="text"
                  name="technology"
                  value={form.technology}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB"
                  required
                />

              </label>


              <label className="creator-field creator-field-full">

                <span>
                  Demo / Live Website URL
                  <b>*</b>
                </span>

                <input
                  type="url"
                  name="demoUrl"
                  value={form.demoUrl}
                  onChange={handleChange}
                  placeholder="https://your-website.com"
                  required
                />

                <small>
                  Buyers can use this link to preview the website.
                </small>

              </label>

            </div>

          </div>


          {/* =================================================
              SCREENSHOTS
          ================================================= */}

          <div className="creator-form-section">

            <div className="creator-form-section-heading">

              <span className="creator-form-step">
                03
              </span>

              <div>
                <h3>
                  Website Screenshots
                </h3>

                <p>
                  Show buyers what your website looks like.
                </p>
              </div>

            </div>


            <div className="creator-screenshots-section">

              <div className="creator-screenshots-heading">

                <div>
                  <span>
                    Marketplace Preview Images
                  </span>

                  <small>
                    Select up to 5 JPG, PNG, or WebP images.
                  </small>
                </div>

                <span className="creator-screenshot-limit">
                  {screenshots.length}/5
                </span>

              </div>


              <label className="creator-screenshot-upload">

                <div className="creator-upload-icon">
                  ↑
                </div>

                <strong>
                  Choose Website Screenshots
                </strong>

                <span>
                  Click to select images from your computer
                </span>

                <small>
                  JPG, PNG, WebP · Maximum 5 images
                </small>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleScreenshotChange}
                />

              </label>


              {screenshots.length > 0 && (
                <div className="creator-selected-screenshots">

                  {screenshots.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}`}
                      className="creator-selected-screenshot"
                    >

                      <div className="creator-selected-screenshot-number">
                        {index + 1}
                      </div>

                      <div className="creator-selected-screenshot-info">

                        <strong>
                          {file.name}
                        </strong>

                        <span>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>


          {/* =================================================
              WEBSITE ZIP
          ================================================= */}

          <div className="creator-form-section">

            <div className="creator-form-section-heading">

              <span className="creator-form-step">
                04
              </span>

              <div>
                <h3>
                  Ready-Made Website
                </h3>

                <p>
                  Upload the complete website that the buyer
                  will receive after a successful purchase.
                </p>
              </div>

            </div>


            <div className="creator-website-zip-section">

              <div className="creator-screenshots-heading">

                <div>
                  <span>
                    Website Source ZIP
                  </span>

                  <small>
                    Upload the complete ready-made website
                    source code as a ZIP file.
                  </small>
                </div>

                <span className="creator-screenshot-limit">
                  1 ZIP
                </span>

              </div>


              <label className="creator-screenshot-upload">

                <div className="creator-upload-icon">
                  ↑
                </div>

                <strong>
                  Choose Website ZIP
                </strong>

                <span>
                  Select the complete ready-made website ZIP
                  from your computer
                </span>

                <small>
                  ZIP only · Maximum 500 MB · 1 file
                </small>

                <input
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={handleWebsiteZipChange}
                />

              </label>


              {websiteZip && (
                <div className="creator-selected-screenshots">

                  <div className="creator-selected-screenshot">

                    <div className="creator-selected-screenshot-number">
                      ZIP
                    </div>

                    <div className="creator-selected-screenshot-info">

                      <strong>
                        {websiteZip.name}
                      </strong>

                      <span>
                        {(websiteZip.size / 1024 / 1024).toFixed(2)} MB
                      </span>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>


          {/* =================================================
              PRICING
          ================================================= */}

          <div className="creator-form-section">

            <div className="creator-form-section-heading">

              <span className="creator-form-step">
                05
              </span>

              <div>
                <h3>
                  Pricing
                </h3>

                <p>
                  Set the price buyers will see on the Marketplace.
                </p>
              </div>

            </div>


            <label className="creator-field creator-price-field">

              <span>
                Website Price
                <b>*</b>
              </span>

              <div className="creator-price-input">

                <span>
                  ₹
                </span>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="25000"
                  min="0"
                  step="1"
                  required
                />

              </div>

              <small>
                Enter the total selling price for your website.
              </small>

            </label>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="creator-listing-actions">

            <Link
              to="/creator/dashboard"
              className="creator-secondary-button"
            >
              Cancel
            </Link>


            <button
              type="submit"
              className="creator-submit-button"
              disabled={
                submitting ||
                categoriesLoading
              }
            >
              {submitting
                ? (
                  <>
                    <span className="creator-submit-spinner" />
                    Submitting...
                  </>
                )
                : (
                  <>
                    Submit Website Listing
                    <span aria-hidden="true">
                      →
                    </span>
                  </>
                )}
            </button>

          </div>


          <p className="creator-form-footer-note">
            Your listing will be reviewed by an administrator
            before it becomes visible to buyers.
          </p>

        </form>

      </section>

    </main>
  )
}