import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { apiRequest } from '../../../../services/apiClient.js'

import {
  addToCart,
} from '../cart/cartService.js'

import { env } from '../../../config/env.js'

import './ProductDetailsPage.css'

const API_ORIGIN =
  env.apiBaseUrl.replace(/\/api\/?$/, '')


export function ProductDetailsPage() {
  const { productId } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      if (!productId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          `/products/${productId}`,
        )

        if (isMounted) {
          setProduct(data?.product ?? null)
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.message ||
              'Failed to load website.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId])


  function handleAddToCart() {
    if (!product) {
      return
    }

    addToCart(product)

    navigate('/cart')
  }


  function formatCurrency(value) {
    return `₹${Number(
      value || 0,
    ).toLocaleString('en-IN')}`
  }


  const primaryScreenshot =
    Array.isArray(product?.screenshots) &&
    product.screenshots.length > 0
      ? product.screenshots[0]
      : null


  const primaryScreenshotUrl =
    primaryScreenshot
      ? primaryScreenshot.startsWith('http')
        ? primaryScreenshot
        : `${API_ORIGIN}${primaryScreenshot}`
      : null


  if (!productId) {
    return (
      <main className="product-details-page">

        <section className="product-details-error">

          <span>
            MARKETPLACE
          </span>

          <h1>
            Website not found
          </h1>

          <p>
            Website ID is missing.
          </p>

          <Link to="/">
            Back to Marketplace
          </Link>

        </section>

      </main>
    )
  }


  if (loading) {
    return (
      <main className="product-details-page">

        <section className="product-details-loading">

          <div className="product-details-spinner" />

          <p>
            Loading website...
          </p>

        </section>

      </main>
    )
  }


  if (error || !product) {
    return (
      <main className="product-details-page">

        <section className="product-details-error">

          <span>
            MARKETPLACE
          </span>

          <h1>
            Website not found
          </h1>

          <p>
            {error ||
              'This website may no longer be available.'}
          </p>

          <Link to="/">
            Back to Marketplace
          </Link>

        </section>

      </main>
    )
  }


  return (
    <main className="product-details-page">

      <header className="product-details-header">

        <Link
          to="/"
          className="product-details-logo"
        >
          Market Palce
        </Link>


        <nav className="product-details-nav">

          <Link to="/">
            Home
          </Link>

          <Link to="/#categories">
            Categories
          </Link>

          <Link to="/#products">
            Websites
          </Link>

          <Link to="/account">
            Account
          </Link>

        </nav>


        <Link
          to="/login"
          className="product-details-login"
        >
          Login
        </Link>

      </header>


      <div className="product-details-container">

        <div className="product-details-breadcrumb">

          <Link to="/">
            Marketplace
          </Link>

          <span>
            /
          </span>

          <span>
            {product.name}
          </span>

        </div>


        <section className="product-details-content">

          <div className="product-details-visual">

            <div className="product-details-image-wrapper">

              {primaryScreenshotUrl ? (
                <a
                  href={primaryScreenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="product-details-main-image-link"
                >

                  <img
                    src={primaryScreenshotUrl}
                    alt={`${product.name} website preview`}
                    className="product-details-image"
                  />

                  <span className="product-details-image-badge">
                    WEBSITE PREVIEW ↗
                  </span>

                </a>
              ) : product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-details-image"
                />
              ) : (
                <div className="product-details-placeholder">

                  <span>
                    WEBSITE
                  </span>

                  <strong>
                    {product.name}
                  </strong>

                </div>
              )}

            </div>

          </div>


          <div className="product-details-info">

            <span className="product-details-label">
              WEBSITE LISTING
            </span>


            <h1>
              {product.name}
            </h1>


            {product.creatorName && (
              <p className="product-details-creator">
                Created by{' '}
                <strong>
                  {product.creatorName}
                </strong>
              </p>
            )}


            <p className="product-details-description">
              {product.description}
            </p>


            <div className="product-details-price-box">

              <span>
                Price
              </span>

              <strong>
                {formatCurrency(product.price)}
              </strong>

            </div>


            <div className="product-details-actions">

              <button
                type="button"
                className="product-details-primary-button"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>


              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="product-details-secondary-button"
                >
                  View Demo ↗
                </a>
              )}

            </div>


            <div className="product-details-info-list">

              <div>
                <span>
                  Website type
                </span>

                <strong>
                  Website
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
                  {product.categoryName ||
                    product.categoryId ||
                    '—'}
                </strong>
              </div>


              <div>
                <span>
                  Availability
                </span>

                <strong>
                  Available
                </strong>
              </div>

            </div>

          </div>

        </section>


        <div className="product-details-back">

          <Link to="/">
            ← Back to Marketplace
          </Link>

        </div>

      </div>


      <footer className="product-details-footer">

        <Link
          to="/"
          className="product-details-logo"
        >
          Market Palce
        </Link>

        <span>
          © {new Date().getFullYear()} Market Palce
        </span>

      </footer>

    </main>
  )
}


export default ProductDetailsPage