import { useEffect, useState } from 'react'

import { useAuth } from '../../../auth/useAuth.js'
import { apiRequest } from '../../../../../services/apiClient.js'

import './FeaturedProductsPage.css'

function FeaturedProductsPage() {
  const { token } = useAuth()

const [products, setProducts] = useState([])
const [categories, setCategories] = useState([])
const [selectedProductIds, setSelectedProductIds] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadProducts() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        setSuccess('')

      const [productData, categoryData, homepageData] =
  await Promise.all([
    apiRequest('/products', {
      token,
    }),

    apiRequest('/categories', {
      token,
    }),

    apiRequest('/website/homepage', {
      token,
    }),
  ])

        setProducts(productData?.products ?? [])
setCategories(categoryData?.categories ?? [])

        setSelectedProductIds(
          homepageData?.homepage?.featuredProductIds ?? [],
        )
      } catch (requestError) {
        setError(
          requestError.message ||
            'Failed to load featured products.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [token])

  const getCategoryName = (categoryId) => {
  const category = categories.find(
    (item) => item._id === categoryId,
  )

  return category?.name ?? 'Uncategorized'
}

  const toggleProduct = (productId) => {
    setSelectedProductIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId)
      }

      return [...current, productId]
    })
  }

  const handleSave = async () => {
    if (!token) {
      setError('You are not authenticated.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const homepageData = await apiRequest(
        '/website/homepage',
        {
          token,
        },
      )

      const currentHomepage = homepageData?.homepage

      if (!currentHomepage) {
        throw new Error(
          'Homepage content could not be loaded.',
        )
      }

      const data = await apiRequest(
        '/website/homepage',
        {
          method: 'PUT',
          token,
          body: {
            heading: currentHomepage.heading,
            description: currentHomepage.description,
            buttonText: currentHomepage.buttonText,
            featuredCategoryIds:
              currentHomepage.featuredCategoryIds ?? [],
            featuredProductIds: selectedProductIds,
          },
        },
      )

      if (data?.homepage) {
        setSelectedProductIds(
          data.homepage.featuredProductIds ?? [],
        )
      }

      setSuccess(
        'Featured products saved successfully.',
      )
    } catch (requestError) {
      setError(
        requestError.message ||
          'Failed to save featured products.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="featured-products-management-page">

      {/* Header */}
      <div className="featured-products-management-header">
        <div>
          <p className="featured-products-breadcrumb">
            Admin / Website Management / Featured Products
          </p>

          <h1>Featured Products</h1>

          <p>
            Choose the products that should appear as featured
            products on your marketplace homepage.
          </p>
        </div>

        <button
          className="featured-products-save-button"
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Status */}
      {loading && (
        <p className="featured-products-status">
          Loading products...
        </p>
      )}

      {error && (
        <p className="featured-products-status error">
          {error}
        </p>
      )}

      {success && (
        <p className="featured-products-status success">
          {success}
        </p>
      )}

      {/* Products Panel */}
      <section className="featured-products-panel">

        <div className="featured-products-panel-header">
          <div>
            <p className="featured-products-panel-label">
              Marketplace
            </p>

            <h2>Available Products</h2>

            <p>
              Select the products you want to feature on
              your homepage.
            </p>
          </div>

          <span className="featured-products-count">
            {selectedProductIds.length} selected
          </span>
        </div>

        {products.length === 0 && !loading ? (
          <div className="featured-products-empty">
            <span>+</span>

            <div>
              <strong>No products available</strong>

              <p>
                Create products first before selecting
                featured products.
              </p>
            </div>
          </div>
        ) : (
          <div className="featured-products-grid">
            {products.map((product) => {
              const selected = selectedProductIds.includes(
                product._id,
              )

              return (
                <button
                  key={product._id}
                  type="button"
                  className={`featured-product-card ${
                    selected ? 'selected' : ''
                  }`}
                  onClick={() =>
                    toggleProduct(product._id)
                  }
                >
                  <div className="featured-product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <span>Product</span>
                    )}

                    <span className="featured-product-check">
                      {selected ? '✓' : ''}
                    </span>
                  </div>

                  <div className="featured-product-content">
                    <div className="featured-product-top">
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        ₹{Number(product.price).toLocaleString(
                          'en-IN',
                        )}
                      </span>
                    </div>

                    <p>
                      {product.description}
                    </p>

                    <small>
  {getCategoryName(product.categoryId)}
</small>
                  </div>
                </button>
              )
            })}
          </div>
        )}

      </section>

    </div>
  )
}

export default FeaturedProductsPage