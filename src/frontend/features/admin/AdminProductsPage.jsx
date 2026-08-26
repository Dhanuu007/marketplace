import { useEffect, useState } from 'react'

import { env } from '../../config/env.js'

import { useAuth } from '../auth/useAuth.js'

import { apiRequest } from '../../../services/apiClient.js'

import { AdminSidebar } from './components/AdminSidebar.jsx'

import { AdminTopbar } from './components/AdminTopbar.jsx'

import './admin-products.css'

import './admin.css'


const API_ORIGIN =
  env.apiBaseUrl.replace(/\/api\/?$/, '')

const EMPTY_FORM = {
  name: '',
  description: '',
  categoryId: '',
  technology: '',
  demoUrl: '',
  price: '',
  screenshots: [],
  websiteZip: null,
  isActive: true,
}


function AdminProductsPage() {
  const { token } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [creatorFilter, setCreatorFilter] = useState('ALL')

  const [isLoading, setIsLoading] = useState(true)
  const [isCategoriesLoading, setIsCategoriesLoading] =
    useState(true)

  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)

  const [reviewingProductId, setReviewingProductId] =
    useState(null)

  const [reviewError, setReviewError] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const [moderatingProductId, setModeratingProductId] =
    useState(null)

  const [moderationError, setModerationError] =
    useState('')

  const [assigningProductId, setAssigningProductId] =
    useState(null)

  const [assignCreatorId, setAssignCreatorId] =
    useState('')

  const [assignCreatorName, setAssignCreatorName] =
    useState('')

  const [assignError, setAssignError] =
    useState('')


  useEffect(() => {
    async function loadProducts() {
      if (!token) {
        setIsLoading(false)
        setError('Authentication is required.')
        return
      }

      try {
        setError('')

        const data = await apiRequest(
          '/products/admin',
          {
            method: 'GET',
            token,
          },
        )

        setProducts(
          Array.isArray(data?.products)
            ? data.products
            : [],
        )
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Failed to load products.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [token])


  useEffect(() => {
    async function loadCategories() {
      if (!token) {
        setIsCategoriesLoading(false)
        setCategoryError(
          'Authentication is required.',
        )
        return
      }

      try {
        setCategoryError('')

        const data = await apiRequest(
          '/categories',
          {
            method: 'GET',
            token,
          },
        )

        setCategories(
          Array.isArray(data?.categories)
            ? data.categories
            : [],
        )
      } catch (requestError) {
        setCategoryError(
          requestError?.message ||
            'Failed to load categories.',
        )
      } finally {
        setIsCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [token])


  function formatCurrency(value) {
    return `₹${Number(
      value || 0,
    ).toLocaleString('en-IN')}`
  }


  const filteredProducts = products.filter((product) => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase()

    const matchesSearch =
      !normalizedSearch ||
      product.name
        ?.toLowerCase()
        .includes(normalizedSearch) ||
      product.slug
        ?.toLowerCase()
        .includes(normalizedSearch) ||
      product.description
        ?.toLowerCase()
        .includes(normalizedSearch)

    const matchesStatus =
      statusFilter === 'ALL' ||
      product.approvalStatus === statusFilter

    const matchesCategory =
      categoryFilter === 'ALL' ||
      product.categoryId === categoryFilter

    const matchesCreator =
      creatorFilter === 'ALL' ||
      product.creatorId === creatorFilter

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesCreator
    )
  })


  const creators = Array.from(
    new Map(
      products
        .filter((product) => product.creatorId)
        .map((product) => [
          product.creatorId,
          {
            id: product.creatorId,
            name:
              product.creatorName ||
              'Assigned Creator',
          },
        ]),
    ).values(),
  )


  function resetProductFilters() {
    setSearchTerm('')
    setStatusFilter('ALL')
    setCategoryFilter('ALL')
    setCreatorFilter('ALL')
  }


  function handleFormChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))

    if (formError) {
      setFormError('')
    }
  }


  function handleScreenshotChange(event) {
    const selectedFiles = Array.from(
      event.target.files || [],
    )

    if (selectedFiles.length > 5) {
      setFormError(
        'You can select a maximum of 5 screenshots.',
      )

      setFormData((currentData) => ({
        ...currentData,
        screenshots: selectedFiles.slice(0, 5),
      }))

      return
    }

    setFormError('')

    setFormData((currentData) => ({
      ...currentData,
      screenshots: selectedFiles,
    }))
  }


  function handleWebsiteZipChange(event) {
    const selectedFile =
      event.target.files?.[0] ?? null

    if (!selectedFile) {
      setFormData((currentData) => ({
        ...currentData,
        websiteZip: null,
      }))

      return
    }


    const maxZipSize =
      500 * 1024 * 1024


    const extension = selectedFile.name
      .split('.')
      .pop()
      ?.toLowerCase()


    if (extension !== 'zip') {
      setFormError(
        'Only ZIP files are allowed for the website upload.',
      )

      setFormData((currentData) => ({
        ...currentData,
        websiteZip: null,
      }))

      event.target.value = ''

      return
    }


    if (selectedFile.size > maxZipSize) {
      setFormError(
        'The website ZIP file must be 500 MB or smaller.',
      )

      setFormData((currentData) => ({
        ...currentData,
        websiteZip: null,
      }))

      event.target.value = ''

      return
    }


    setFormError('')

    setFormData((currentData) => ({
      ...currentData,
      websiteZip: selectedFile,
    }))
  }


  function openAddProductForm() {
    setFormData(EMPTY_FORM)
    setFormError('')
    setIsFormOpen(true)
  }


  function closeAddProductForm() {
    if (isSubmitting) {
      return
    }

    setFormData(EMPTY_FORM)
    setFormError('')
    setIsFormOpen(false)
  }


  async function handleSubmit(event) {
    event.preventDefault()

    setFormError('')

    if (!token) {
      setFormError(
        'Authentication is required.',
      )

      return
    }


    if (!formData.websiteZip) {
      setFormError(
        'Please select the ready-made website ZIP file.',
      )

      return
    }


    try {
      setIsSubmitting(true)

      const formDataToSend = new FormData()

      formDataToSend.append(
        'name',
        formData.name,
      )

      formDataToSend.append(
        'slug',
        createSlug(formData.name),
      )

      formDataToSend.append(
        'description',
        formData.description,
      )

      formDataToSend.append(
        'price',
        String(Number(formData.price)),
      )

      formDataToSend.append(
        'image',
        '',
      )

      formDataToSend.append(
        'categoryId',
        formData.categoryId,
      )

      formDataToSend.append(
        'demoUrl',
        formData.demoUrl,
      )

      formDataToSend.append(
        'technology',
        formData.technology,
      )

      formDataToSend.append(
        'isActive',
        String(formData.isActive),
      )


      formData.screenshots.forEach((file) => {
        formDataToSend.append(
          'screenshots',
          file,
        )
      })


      formDataToSend.append(
        'websiteZip',
        formData.websiteZip,
      )


      const data = await apiRequest(
        '/products',
        {
          method: 'POST',
          token,
          body: formDataToSend,
        },
      )


      if (!data?.product) {
        throw new Error(
          'Product was not created.',
        )
      }


      setProducts((currentProducts) => [
        data.product,
        ...currentProducts,
      ])

      setFormData(EMPTY_FORM)
      setFormError('')
      setIsFormOpen(false)
    } catch (requestError) {
      setFormError(
        requestError?.message ||
          'Failed to create product.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  function createSlug(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }


  async function handleReview(
    productId,
    approvalStatus,
  ) {
    if (!token) {
      setReviewError(
        'Authentication is required.',
      )

      return
    }

    try {
      setReviewing(true)
      setReviewingProductId(productId)
      setReviewError('')

      const data = await apiRequest(
        `/products/admin/${productId}/review`,
        {
          method: 'PATCH',
          token,
          body: {
            approvalStatus,
          },
        },
      )

      if (!data?.product) {
        throw new Error(
          'Unable to update product approval status.',
        )
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === productId
            ? data.product
            : product,
        ),
      )
    } catch (requestError) {
      setReviewError(
        requestError?.message ||
          'Unable to update product approval status.',
      )
    } finally {
      setReviewing(false)
      setReviewingProductId(null)
    }
  }


  async function handleDeleteProduct(productId) {
    if (!token) {
      setModerationError(
        'Authentication is required.',
      )

      return
    }

    const product =
      products.find(
        (item) => item._id === productId,
      )

    if (!product) {
      setModerationError(
        'Product not found.',
      )

      return
    }

    const confirmed = window.confirm(
      `Delete "${product.name}" from the marketplace? This will hide the website from Buyers and Creators. The listing will remain available to Admin for re-listing.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setModeratingProductId(productId)
      setModerationError('')

      const data = await apiRequest(
        `/products/admin/${productId}/delete`,
        {
          method: 'PATCH',
          token,
        },
      )

      if (!data?.product) {
        throw new Error(
          'Unable to delete product.',
        )
      }

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct._id === productId
            ? data.product
            : currentProduct,
        ),
      )
    } catch (requestError) {
      setModerationError(
        requestError?.message ||
          'Unable to delete product.',
      )
    } finally {
      setModeratingProductId(null)
    }
  }


  async function handleRelistProduct(productId) {
    if (!token) {
      setModerationError(
        'Authentication is required.',
      )

      return
    }

    try {
      setModeratingProductId(productId)
      setModerationError('')

      const data = await apiRequest(
        `/products/admin/${productId}/relist`,
        {
          method: 'PATCH',
          token,
        },
      )

      if (!data?.product) {
        throw new Error(
          'Unable to re-list product.',
        )
      }

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct._id === productId
            ? data.product
            : currentProduct,
        ),
      )
    } catch (requestError) {
      setModerationError(
        requestError?.message ||
          'Unable to re-list product.',
      )
    } finally {
      setModeratingProductId(null)
    }
  }


  function openAssignCreator(productId) {
    setAssigningProductId(productId)

    setAssignCreatorId(
      '6a7d97b0896af8085130e598',
    )

    setAssignCreatorName(
      'Dhananjay Bhite',
    )

    setAssignError('')
  }


  function closeAssignCreator() {
    setAssigningProductId(null)
    setAssignCreatorId('')
    setAssignCreatorName('')
    setAssignError('')
  }


  async function handleAssignCreator(productId) {
    if (!token) {
      setAssignError(
        'Authentication is required.',
      )

      return
    }

    if (!assignCreatorId.trim()) {
      setAssignError(
        'Creator ID is required.',
      )

      return
    }

    if (!assignCreatorName.trim()) {
      setAssignError(
        'Creator name is required.',
      )

      return
    }

    try {
      setAssignError('')

      const data = await apiRequest(
        `/products/admin/${productId}/assign-creator`,
        {
          method: 'PATCH',
          token,
          body: {
            creatorId:
              assignCreatorId.trim(),

            creatorName:
              assignCreatorName.trim(),
          },
        },
      )

      if (!data?.product) {
        throw new Error(
          'Unable to assign product to creator.',
        )
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === productId
            ? data.product
            : product,
        ),
      )

      closeAssignCreator()
    } catch (requestError) {
      setAssignError(
        requestError?.message ||
          'Unable to assign product to creator.',
      )
    }
  }


  return (
    <div className="admin-layout admin-products-page">

      <AdminSidebar
        isOpen={sidebarOpen}
        onNavigate={() =>
          setSidebarOpen(false)
        }
      />


      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay visible"
          type="button"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}


      <div className="admin-main">

        <AdminTopbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />


        <main className="admin-content">

          {/* =====================================================
              PAGE HEADER
              ===================================================== */}

          <section className="admin-page-header">

            <div>
              <span className="admin-eyebrow">
                Marketplace
              </span>

              <h1>
                Products
              </h1>

              <p>
                View and manage products in your
                marketplace.
              </p>
            </div>


            <div className="admin-header-actions">

              <button
                type="button"
                className="admin-primary-button"
                onClick={openAddProductForm}
              >
                + Add Product
              </button>

            </div>

          </section>



          {/* =====================================================
              PRODUCT STATISTICS
              ===================================================== */}

          <section className="admin-products-stats">

            {/* Total Products */}

            <article className="admin-products-stat-card">

              <div className="admin-products-stat-icon total">
                <span>◆</span>
              </div>


              <div className="admin-products-stat-content">

                <span>
                  Total Products
                </span>

                <strong>
                  {products.length}
                </strong>

                <small>
                  All listed websites
                </small>

              </div>

            </article>



            {/* Pending Review */}

            <article className="admin-products-stat-card">

              <div className="admin-products-stat-icon pending">
                <span>◷</span>
              </div>


              <div className="admin-products-stat-content">

                <span>
                  Pending Review
                </span>

                <strong>
                  {
                    products.filter(
                      (product) =>
                        product.approvalStatus ===
                        'PENDING',
                    ).length
                  }
                </strong>

                <small>
                  Awaiting approval
                </small>

              </div>

            </article>



            {/* Approved */}

            <article className="admin-products-stat-card">

              <div className="admin-products-stat-icon approved">
                <span>✓</span>
              </div>


              <div className="admin-products-stat-content">

                <span>
                  Approved
                </span>

                <strong>
                  {
                    products.filter(
                      (product) =>
                        product.approvalStatus ===
                        'APPROVED',
                    ).length
                  }
                </strong>

                <small>
                  Published websites
                </small>

              </div>

            </article>



            {/* Rejected */}

            <article className="admin-products-stat-card">

              <div className="admin-products-stat-icon rejected">
                <span>×</span>
              </div>


              <div className="admin-products-stat-content">

                <span>
                  Rejected
                </span>

                <strong>
                  {
                    products.filter(
                      (product) =>
                        product.approvalStatus ===
                        'REJECTED',
                    ).length
                  }
                </strong>

                <small>
                  Not approved
                </small>

              </div>

            </article>



            {/* Deleted */}

            <article className="admin-products-stat-card">

              <div className="admin-products-stat-icon rejected">
                <span>×</span>
              </div>


              <div className="admin-products-stat-content">

                <span>
                  Deleted
                </span>

                <strong>
                  {
                    products.filter(
                      (product) =>
                        product.approvalStatus ===
                        'DELETED',
                    ).length
                  }
                </strong>

                <small>
                  Soft-deleted websites
                </small>

              </div>

            </article>

          </section>



          {/* =====================================================
              ADD PRODUCT FORM
              ===================================================== */}

          {isFormOpen && (

            <section className="admin-panel admin-product-form-panel">

              <div className="admin-panel-header">

                <div>

                  <span className="admin-panel-eyebrow">
                    Website Listing
                  </span>

                  <h3>
                    Add Website Listing
                  </h3>

                </div>


                <button
                  type="button"
                  className="admin-text-button"
                  onClick={closeAddProductForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

              </div>


              <form
                className="admin-product-form"
                onSubmit={handleSubmit}
              >

                {formError && (
                  <div
                    className="admin-orders-error"
                    role="alert"
                  >
                    {formError}
                  </div>
                )}


                {/* BASIC INFORMATION */}

                <div className="admin-product-form-section">

                  <div className="admin-product-form-section-heading">

                    <span>
                      01
                    </span>

                    <div>
                      <h4>
                        Basic Information
                      </h4>

                      <p>
                        Add the main information buyers
                        need about the website.
                      </p>
                    </div>

                  </div>


                  <div className="admin-product-form-grid">

                    <label className="admin-product-form-full">

                      <span>
                        Website Name
                      </span>

                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Modern Restaurant Website"
                        required
                      />

                    </label>


                    <label className="admin-product-form-full">

                      <span>
                        Description
                      </span>

                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Describe the website, its purpose, design, features, and what makes it valuable to buyers."
                        rows="6"
                        required
                      />

                    </label>

                  </div>

                </div>



                {/* WEBSITE DETAILS */}

                <div className="admin-product-form-section">

                  <div className="admin-product-form-section-heading">

                    <span>
                      02
                    </span>

                    <div>
                      <h4>
                        Website Details
                      </h4>

                      <p>
                        Help buyers understand the
                        technology and category.
                      </p>
                    </div>

                  </div>


                  <div className="admin-product-form-grid">

                    <label>

                      <span>
                        Website Category
                      </span>

                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleFormChange}
                        required
                        disabled={
                          isCategoriesLoading ||
                          categories.length === 0
                        }
                      >

                        <option value="">
                          {isCategoriesLoading
                            ? 'Loading categories...'
                            : categories.length === 0
                              ? 'No categories available'
                              : 'Select a category'}
                        </option>


                        {categories.map(
                          (category) => (
                            <option
                              key={category._id}
                              value={category._id}
                            >
                              {category.name}
                            </option>
                          ),
                        )}

                      </select>

                    </label>


                    <label>

                      <span>
                        Technology
                      </span>

                      <input
                        name="technology"
                        type="text"
                        value={formData.technology}
                        onChange={handleFormChange}
                        placeholder="React, Node.js, MongoDB"
                        required
                      />

                    </label>


                    <label className="admin-product-form-full">

                      <span>
                        Demo / Live Website URL
                      </span>

                      <input
                        name="demoUrl"
                        type="url"
                        value={formData.demoUrl}
                        onChange={handleFormChange}
                        placeholder="https://your-website.com"
                        required
                      />

                    </label>

                  </div>

                </div>



                {/* SCREENSHOTS */}

                <div className="admin-product-form-section">

                  <div className="admin-product-form-section-heading">

                    <span>
                      03
                    </span>

                    <div>
                      <h4>
                        Website Screenshots
                      </h4>

                      <p>
                        Show buyers what the website
                        looks like.
                      </p>
                    </div>

                  </div>


                  <div className="admin-product-upload-section">

                    <div className="admin-product-upload-heading">

                      <div>
                        <span>
                          Marketplace Preview Images
                        </span>

                        <small>
                          Select up to 5 JPG, PNG, or
                          WebP images.
                        </small>
                      </div>

                      <span>
                        {formData.screenshots.length}/5
                      </span>

                    </div>


                    <label className="admin-product-upload-box">

                      <div>
                        ↑
                      </div>

                      <strong>
                        Choose Website Screenshots
                      </strong>

                      <span>
                        Click to select images from
                        your computer
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


                    {formData.screenshots.length > 0 && (
                      <div className="admin-product-selected-files">

                        {formData.screenshots.map(
                          (file, index) => (

                            <div
                              key={`${file.name}-${file.lastModified}`}
                              className="admin-product-selected-file"
                            >

                              <div>
                                {index + 1}
                              </div>

                              <div>

                                <strong>
                                  {file.name}
                                </strong>

                                <span>
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>

                              </div>

                            </div>

                          ),
                        )}

                      </div>
                    )}

                  </div>

                </div>



                {/* WEBSITE ZIP */}

                <div className="admin-product-form-section">

                  <div className="admin-product-form-section-heading">

                    <span>
                      04
                    </span>

                    <div>
                      <h4>
                        Ready-Made Website
                      </h4>

                      <p>
                        Upload the complete website that
                        the buyer will receive after purchase.
                      </p>
                    </div>

                  </div>


                  <div className="admin-product-upload-section">

                    <div className="admin-product-upload-heading">

                      <div>
                        <span>
                          Website Source ZIP
                        </span>

                        <small>
                          Upload the complete ready-made
                          website source code.
                        </small>
                      </div>

                      <span>
                        1 ZIP
                      </span>

                    </div>


                    <label className="admin-product-upload-box">

                      <div>
                        ↑
                      </div>

                      <strong>
                        Choose Website ZIP
                      </strong>

                      <span>
                        Select the complete ready-made
                        website ZIP from your computer
                      </span>

                      <small>
                        ZIP only · Maximum 500 MB · 1 file
                      </small>

                      <input
                        type="file"
                        accept=".zip,application/zip,application/x-zip-compressed"
                        onChange={handleWebsiteZipChange}
                        required
                      />

                    </label>


                    {formData.websiteZip && (
                      <div className="admin-product-selected-files">

                        <div className="admin-product-selected-file">

                          <div>
                            ZIP
                          </div>

                          <div>

                            <strong>
                              {formData.websiteZip.name}
                            </strong>

                            <span>
                              {(formData.websiteZip.size / 1024 / 1024).toFixed(2)} MB
                            </span>

                          </div>

                        </div>

                      </div>
                    )}

                  </div>

                </div>



                {/* PRICING */}

                <div className="admin-product-form-section">

                  <div className="admin-product-form-section-heading">

                    <span>
                      05
                    </span>

                    <div>
                      <h4>
                        Pricing
                      </h4>

                      <p>
                        Set the price buyers will see
                        on the Marketplace.
                      </p>
                    </div>

                  </div>


                  <label className="admin-product-price-field">

                    <span>
                      Website Price
                    </span>

                    <div className="admin-product-price-input">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        placeholder="25000"
                        min="0"
                        step="1"
                        required
                      />

                    </div>

                    <small>
                      Enter the total selling price
                      for the website.
                    </small>

                  </label>

                </div>



                {categoryError && (
                  <div
                    className="admin-orders-error"
                    role="alert"
                  >
                    {categoryError}
                  </div>
                )}



                <label className="admin-product-active-field">

                  <input
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                  />

                  <span>
                    Publish website immediately
                  </span>

                </label>



                <div className="admin-product-form-actions">

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={closeAddProductForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="admin-primary-button"
                    disabled={
                      isSubmitting ||
                      isCategoriesLoading ||
                      categories.length === 0
                    }
                  >
                    {isSubmitting
                      ? 'Creating Listing...'
                      : 'Create Website Listing'}
                  </button>

                </div>

              </form>

            </section>

          )}



          {/* =====================================================
              WEBSITE REVIEW
              ===================================================== */}

          <section className="admin-panel admin-review-panel">

            <div className="admin-panel-header">

              <div>

                <span className="admin-panel-eyebrow">
                  Website Review
                </span>

                <h3>
                  Pending Website Listings
                </h3>

              </div>


              <span className="admin-orders-count">

                {
                  products.filter(
                    (product) =>
                      product.approvalStatus ===
                      'PENDING',
                  ).length
                }{' '}

                pending

              </span>

            </div>



            {reviewError && (
              <div
                className="admin-orders-error"
                role="alert"
              >
                {reviewError}
              </div>
            )}



            {
              products.filter(
                (product) =>
                  product.approvalStatus ===
                  'PENDING',
              ).length === 0 && (

                <div className="admin-orders-empty">

                  <strong>
                    No pending website listings
                  </strong>

                  <span>
                    All submitted websites have been reviewed.
                  </span>

                </div>

              )
            }



            {
              products
                .filter(
                  (product) =>
                    product.approvalStatus ===
                    'PENDING',
                )
                .map((product) => (

                  <article
                    key={product._id}
                    className="admin-review-card"
                  >

                    <div className="admin-review-card-header">

                      <div>

                        <span className="admin-panel-eyebrow">
                          Website Listing
                        </span>

                        <h4>
                          {product.name}
                        </h4>

                        <p>
                          Created by{' '}

                          <strong>
                            {product.creatorName ||
                              'Unknown Creator'}
                          </strong>
                        </p>

                      </div>


                      <span className="status-badge pending">
                        PENDING
                      </span>

                    </div>



                    <div className="admin-review-details">

                      <div>

                        <span>
                          Price
                        </span>

                        <strong>
                          {formatCurrency(
                            product.price,
                          )}
                        </strong>

                      </div>



                      <div>

                        <span>
                          Technology
                        </span>

                        <strong>
                          {product.technology || '—'}
                        </strong>

                      </div>



                      <div>

                        <span>
                          Category
                        </span>

                        <strong>
                          {product.categoryId || '—'}
                        </strong>

                      </div>



                      <div>

                        <span>
                          Submitted
                        </span>

                        <strong>
                          {product.createdAt
                            ? new Date(
                                product.createdAt,
                              ).toLocaleDateString()
                            : '—'}
                        </strong>

                      </div>

                    </div>



                    <div className="admin-review-description">

                      <span>
                        Description
                      </span>

                      <p>
                        {product.description ||
                          'No description provided.'}
                      </p>

                    </div>



                    {product.demoUrl && (

                      <div className="admin-review-demo">

                        <span>
                          Demo Website
                        </span>

                        <a
                          href={product.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Demo ↗
                        </a>

                      </div>

                    )}



                    {Array.isArray(product.screenshots) &&
                      product.screenshots.length > 0 && (

                        <div className="admin-review-screenshots">

                          <div className="admin-review-screenshots-heading">

                            <span>
                              Website Screenshots
                            </span>

                            <small>
                              {product.screenshots.length}{' '}

                              {product.screenshots.length === 1
                                ? 'screenshot'
                                : 'screenshots'}
                            </small>

                          </div>



                          <div className="admin-review-screenshot-grid">

                            {product.screenshots.map(
                              (screenshot, index) => (

                                <a
                                  key={`${screenshot}-${index}`}
                                  href={`${API_ORIGIN}${screenshot}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="admin-review-screenshot"
                                >
                                  <img
                                    src={`${API_ORIGIN}${screenshot}`}
                                    alt={`${product.name} screenshot ${
                                      index + 1
                                    }`}
                                  />
                                </a>
                              ),
                            )}

                          </div>

                        </div>

                    )}



                    <div className="admin-review-actions">

                      <button
                        type="button"
                        className="admin-secondary-button admin-reject-button"
                        disabled={
                          reviewing &&
                          reviewingProductId ===
                            product._id
                        }
                        onClick={() =>
                          handleReview(
                            product._id,
                            'REJECTED',
                          )
                        }
                      >
                        {reviewing &&
                        reviewingProductId ===
                          product._id
                          ? 'Updating...'
                          : 'Reject'}
                      </button>



                      <button
                        type="button"
                        className="admin-primary-button"
                        disabled={
                          reviewing &&
                          reviewingProductId ===
                            product._id
                        }
                        onClick={() =>
                          handleReview(
                            product._id,
                            'APPROVED',
                          )
                        }
                      >
                        {reviewing &&
                        reviewingProductId ===
                          product._id
                          ? 'Updating...'
                          : 'Approve'}
                      </button>

                    </div>

                  </article>

                ))
            }

          </section>



          {/* =====================================================
              ALL PRODUCTS
              ===================================================== */}

          <section className="admin-panel admin-products-list-panel">

            <div className="admin-panel-header">

              <div>

                <span className="admin-panel-eyebrow">
                  Management
                </span>

                <h3>
                  All Products
                </h3>

              </div>


              <span className="admin-orders-count">

                {filteredProducts.length}{' '}

                {filteredProducts.length === 1
                  ? 'product'
                  : 'products'}

              </span>

            </div>



            {/* =====================================================
                PRODUCT FILTER TOOLBAR
                ===================================================== */}

            <div className="admin-products-toolbar">

              <div className="admin-products-search">

                <span className="admin-products-search-icon">
                  ⌕
                </span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Search products..."
                  aria-label="Search products"
                />

              </div>



              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                aria-label="Filter by status"
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="DELETED">
                  Deleted
                </option>

              </select>



              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                aria-label="Filter by category"
              >

                <option value="ALL">
                  All Categories
                </option>

                {categories.map(
                  (category) => (

                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>

                  ),
                )}

              </select>



              <select
                value={creatorFilter}
                onChange={(event) =>
                  setCreatorFilter(
                    event.target.value,
                  )
                }
                aria-label="Filter by creator"
              >

                <option value="ALL">
                  All Creators
                </option>

                {creators.map(
                  (creator) => (

                    <option
                      key={creator.id}
                      value={creator.id}
                    >
                      {creator.name}
                    </option>

                  ),
                )}

              </select>



              <button
                type="button"
                className="admin-products-reset-button"
                onClick={resetProductFilters}
              >
                Reset
              </button>



              <button
                type="button"
                className="admin-primary-button admin-products-toolbar-add"
                onClick={openAddProductForm}
              >
                + Add Product
              </button>

            </div>



            {moderationError && (
              <div
                className="admin-orders-error"
                role="alert"
              >
                {moderationError}
              </div>
            )}



            {assignError && (
              <div
                className="admin-orders-error"
                role="alert"
              >
                {assignError}
              </div>
            )}



            {isLoading && (
              <div className="admin-orders-message">
                Loading products...
              </div>
            )}



            {!isLoading && error && (
              <div className="admin-orders-error">
                {error}
              </div>
            )}



            {!isLoading &&
              !error &&
              products.length === 0 && (

                <div className="admin-orders-empty">

                  <strong>
                    No products found
                  </strong>

                  <span>
                    Products will appear here.
                  </span>

                </div>

              )}



            {!isLoading &&
              !error &&
              products.length > 0 &&
              filteredProducts.length === 0 && (

                <div className="admin-orders-empty">

                  <strong>
                    No matching products
                  </strong>

                  <span>
                    Try changing your search or filters.
                  </span>

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={resetProductFilters}
                  >
                    Clear Filters
                  </button>

                </div>

              )}



            {!isLoading &&
              !error &&
              filteredProducts.length > 0 && (

                <div className="admin-products-table-wrapper">

                  <table className="admin-products-table">

                    <thead>

                      <tr>

                        <th>
                          Product
                        </th>

                        <th>
                          Creator
                        </th>

                        <th>
                          Category
                        </th>

                        <th>
                          Price
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>



                    <tbody>

                      {filteredProducts.map(
                        (product) => {

                          const productImage =
                            product.image ||
                            (
                              Array.isArray(
                                product.screenshots,
                              ) &&
                              product.screenshots.length >
                                0
                            )
                              ? `${API_ORIGIN}${product.screenshots[0]}`
                              : ''


                          const statusClass =
                            product.approvalStatus ===
                            'APPROVED'
                              ? 'approved'
                              : product.approvalStatus ===
                                  'REJECTED'
                                ? 'rejected'
                                : product.approvalStatus ===
                                    'DELETED'
                                  ? 'rejected'
                                  : 'pending'


                          const statusLabel =
                            product.approvalStatus ||
                            'PENDING'


                          const creatorInitial =
                            (
                              product.creatorName ||
                              'U'
                            )
                              .trim()
                              .charAt(0)
                              .toUpperCase()


                          return (

                            <tr key={product._id}>

                              {/* Product */}

                              <td>

                                <div className="admin-product-table-product">

                                  <div className="admin-product-table-image">

                                    {productImage ? (

                                      <img
                                        src={productImage}
                                        alt={product.name}
                                      />

                                    ) : (

                                      <div className="admin-product-table-image-placeholder">

                                        <span>
                                          ◆
                                        </span>

                                      </div>

                                    )}

                                  </div>



                                  <div className="admin-product-table-product-info">

                                    <strong>
                                      {product.name}
                                    </strong>

                                    <span>
                                      /{product.slug}
                                    </span>

                                  </div>

                                </div>

                              </td>



                              {/* Creator */}

                              <td>

                                {product.creatorId ? (

                                  <div className="admin-product-table-creator">

                                    <div className="admin-product-table-avatar">
                                      {creatorInitial}
                                    </div>

                                    <div>

                                      <strong>
                                        {product.creatorName ||
                                          'Assigned Creator'}
                                      </strong>

                                      <span>
                                        Creator
                                      </span>

                                    </div>

                                  </div>

                                ) : (

                                  <span className="admin-product-unassigned">
                                    Not assigned
                                  </span>

                                )}

                              </td>



                              {/* Category */}

                              <td>

                                <span className="admin-product-category-badge">

                                  {product.categoryId ||
                                    'Uncategorized'}

                                </span>

                              </td>



                              {/* Price */}

                              <td>

                                <strong className="admin-product-price">

                                  {formatCurrency(
                                    product.price,
                                  )}

                                </strong>

                              </td>



                              {/* Status */}

                              <td>

                                <div className="admin-product-status-group">

                                  <span
                                    className={`admin-product-approval-badge ${statusClass}`}
                                  >

                                    <span className="admin-product-status-dot" />

                                    {statusLabel}

                                  </span>


                                  <span
                                    className={
                                      product.isActive
                                        ? 'admin-product-active-label'
                                        : 'admin-product-inactive-label'
                                    }
                                  >

                                    {product.isActive
                                      ? 'Active'
                                      : 'Inactive'}

                                  </span>

                                </div>

                              </td>



                              {/* Action */}

                              <td>

                                <div className="admin-product-assignment">

                                  {product.approvalStatus ===
                                    'APPROVED' && (

                                    <button
                                      type="button"
                                      className="admin-secondary-button admin-product-delete-button"
                                      disabled={
                                        moderatingProductId ===
                                        product._id
                                      }
                                      onClick={() =>
                                        handleDeleteProduct(
                                          product._id,
                                        )
                                      }
                                    >
                                      {moderatingProductId ===
                                      product._id
                                        ? 'Deleting...'
                                        : 'Delete'}
                                    </button>

                                  )}


                                  {product.approvalStatus ===
                                    'DELETED' && (

                                    <button
                                      type="button"
                                      className="admin-primary-button admin-product-relist-button"
                                      disabled={
                                        moderatingProductId ===
                                        product._id
                                      }
                                      onClick={() =>
                                        handleRelistProduct(
                                          product._id,
                                        )
                                      }
                                    >
                                      {moderatingProductId ===
                                      product._id
                                        ? 'Re-listing...'
                                        : 'Re-list'}
                                    </button>

                                  )}


                                  {product.creatorId ? (

                                    <span className="admin-product-action-complete">
                                      Assigned
                                    </span>

                                  ) : (

                                    <div className="admin-product-assignment">

                                      {assigningProductId ===
                                      product._id ? (

                                        <div className="admin-product-assignment-form">

                                          <input
                                            type="text"
                                            value={
                                              assignCreatorId
                                            }
                                            onChange={(event) =>
                                              setAssignCreatorId(
                                                event.target
                                                  .value,
                                              )
                                            }
                                            placeholder="Creator ID"
                                          />


                                          <input
                                            type="text"
                                            value={
                                              assignCreatorName
                                            }
                                            onChange={(event) =>
                                              setAssignCreatorName(
                                                event.target
                                                  .value,
                                              )
                                            }
                                            placeholder="Creator name"
                                          />


                                          {assignError && (

                                            <div
                                              className="admin-orders-error"
                                              role="alert"
                                            >
                                              {assignError}
                                            </div>

                                          )}


                                          <div className="admin-product-assignment-actions">

                                            <button
                                              type="button"
                                              className="admin-primary-button"
                                              onClick={() =>
                                                handleAssignCreator(
                                                  product._id,
                                                )
                                              }
                                            >
                                              Confirm
                                            </button>


                                            <button
                                              type="button"
                                              className="admin-secondary-button"
                                              onClick={
                                                closeAssignCreator
                                              }
                                            >
                                              Cancel
                                            </button>

                                          </div>

                                        </div>

                                      ) : (

                                        <button
                                          type="button"
                                          className="admin-product-assign-button"
                                          onClick={() =>
                                            openAssignCreator(
                                              product._id,
                                            )
                                          }
                                        >
                                          Assign Creator
                                        </button>

                                      )}

                                    </div>

                                  )}

                                </div>

                              </td>

                            </tr>

                          )
                        },
                      )}

                    </tbody>

                  </table>

                </div>

              )}

          </section>

        </main>

      </div>

    </div>
  )
}


export default AdminProductsPage
export { AdminProductsPage }
