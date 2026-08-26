import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { apiRequest } from '../../../../services/apiClient.js'

import './ProductsPage.css'

export function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest('/products/public')

        if (isMounted) {
          setProducts(data?.products ?? [])
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message ||
              'Failed to load marketplace products.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <main className="marketplace-products-page">
        <section className="products-loading">
          <div className="products-loading-spinner" />

          <p>Loading products...</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="marketplace-products-page">
        <section className="products-error">
          <span className="products-error-label">
            Marketplace
          </span>

          <h1>Unable to load products</h1>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="marketplace-products-page">

      {/* =========================
          HEADER
      ========================== */}

      <header className="marketplace-products-header">

        <div className="products-header-inner">

          <Link
            to="/"
            className="products-logo"
          >
            Market Palce
          </Link>

          <nav
            className="products-nav"
            aria-label="Main navigation"
          >
            <Link to="/">
              Home
            </Link>

            <Link to="/products" className="active">
              Products
            </Link>

            <Link to="/account">
              Account
            </Link>
          </nav>

          <div className="products-header-actions">

            <Link
              to="/login"
              className="products-login-link"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="products-get-started"
            >
              Get Started
            </Link>

          </div>

        </div>

      </header>


      {/* =========================
          HERO
      ========================== */}

      <section className="products-hero">

        <div className="products-hero-inner">

          <div>

            <span className="products-eyebrow">
              MARKETPLACE
            </span>

            <h1>
              Explore Our Products
            </h1>

            <p>
              Discover premium websites, templates, and
              digital products created for modern businesses
              and creative professionals.
            </p>

          </div>

          <div className="products-hero-stat">

            <strong>
              {products.length}
            </strong>

            <span>
              Available Products
            </span>

          </div>

        </div>

      </section>


      {/* =========================
          PRODUCTS
      ========================== */}

      <section className="products-content">

        <div className="products-section-header">

          <div>

            <span className="products-section-label">
              DIGITAL MARKETPLACE
            </span>

            <h2>
              All Products
            </h2>

            <p>
              Browse our complete collection of premium
              digital products.
            </p>

          </div>

          <span className="products-count">
            {products.length} products
          </span>

        </div>


        {products.length === 0 ? (
          <div className="products-empty">

            <span className="products-empty-icon">
              +
            </span>

            <h3>
              No products available
            </h3>

            <p>
              There are currently no active products
              available in the marketplace.
            </p>

          </div>
        ) : (
          <div className="products-grid">

            {products.map((product) => (
              <article
                key={product._id}
                className="product-card"
              >

                {/* Product Image */}

                <div className="product-card-image">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <div className="product-image-placeholder">

                      <span>
                        DIGITAL PRODUCT
                      </span>

                      <strong>
                        {product.name}
                      </strong>

                    </div>
                  )}

                  <span className="product-card-badge">
                    DIGITAL PRODUCT
                  </span>

                </div>


                {/* Product Content */}

                <div className="product-card-content">

                  <span className="product-card-category">
                    MARKETPLACE
                  </span>

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.description}
                  </p>


                  <div className="product-card-footer">

                    <div className="product-price">

                      <span>
                        Price
                      </span>

                      <strong>
                        ₹{Number(
                          product.price,
                        ).toLocaleString('en-IN')}
                      </strong>

                    </div>

                    <Link
                      to={`/product/${product._id}`}
                      className="product-view-button"
                    >
                      View Product
                    </Link>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>


      {/* =========================
          FOOTER
      ========================== */}

      <footer className="products-footer">

        <div className="products-footer-inner">

          <div className="products-footer-brand">

            <Link
              to="/"
              className="products-logo"
            >
              Market Palce
            </Link>

            <p>
              A premium marketplace for websites,
              templates, and digital products.
            </p>

          </div>


          <div className="products-footer-links">

            <div>

              <strong>
                Marketplace
              </strong>

              <Link to="/">
                Home
              </Link>

              <Link to="/products">
                Products
              </Link>

            </div>


            <div>

              <strong>
                Account
              </strong>

              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>

              <Link to="/account">
                My Account
              </Link>

            </div>

          </div>

        </div>


        <div className="products-footer-bottom">

          <span>
            © {new Date().getFullYear()} Market Palce
          </span>

          <span>
            Premium digital marketplace
          </span>

        </div>

      </footer>

    </main>
  )
}

export default ProductsPage