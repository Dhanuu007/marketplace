import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { apiRequest } from '../../../../services/apiClient.js'

import './CategoryPage.css'


export function CategoryPage() {
  const { slug } = useParams()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    let isMounted = true

    async function loadCategory() {
      if (!slug) {
        return
      }

      try {
        setLoading(true)
        setError('')

        const categoryData = await apiRequest(
          `/categories/${slug}`,
        )

        const categoryResult =
          categoryData?.category

        if (!categoryResult) {
          throw new Error('Category not found.')
        }

        const productData = await apiRequest(
          `/products/category/${categoryResult._id}`,
        )

        if (isMounted) {
          setCategory(categoryResult)
          setProducts(
            productData?.products ?? [],
          )
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message ||
              'Failed to load category.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadCategory()

    return () => {
      isMounted = false
    }
  }, [slug])


  if (loading) {
    return (
      <main className="category-page">
        <section className="category-loading">

          <div className="category-loading-spinner" />

          <p>
            Loading category...
          </p>

        </section>
      </main>
    )
  }


  if (error || !category) {
    return (
      <main className="category-page">

        <section className="category-error">

          <span>
            MARKETPLACE
          </span>

          <h1>
            Category not found
          </h1>

          <p>
            {error ||
              'This category may no longer be available.'}
          </p>

          <Link to="/">
            Back to Marketplace
          </Link>

        </section>

      </main>
    )
  }


  return (
    <main className="category-page">

      {/* Header */}

      <header className="category-header">

        <Link
          to="/"
          className="category-logo"
        >
          Market Palce
        </Link>

        <nav className="category-nav">

          <Link to="/">
            Home
          </Link>

          <a href="#products">
            Products
          </a>

          <Link to="/account">
            Account
          </Link>

        </nav>

        <div className="category-header-actions">

          <Link
            to="/login"
            className="category-login"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="category-header-button"
          >
            Get Started
          </Link>

        </div>

      </header>


      {/* Category Hero */}

      <section className="category-hero">

        <div className="category-hero-content">

          <Link
            to="/"
            className="category-back-link"
          >
            ← Back to Marketplace
          </Link>

          <span className="category-label">
            CATEGORY
          </span>

          <h1>
            {category.name}
          </h1>

          <p>
            {category.description}
          </p>

        </div>

        <div className="category-hero-decoration">
          <span>
            {category.name
              ?.charAt(0)
              ?.toUpperCase()}
          </span>
        </div>

      </section>


      {/* Products */}

      <section
        id="products"
        className="category-products-section"
      >

        <div className="category-section-header">

          <div>

            <span className="category-section-label">
              MARKETPLACE
            </span>

            <h2>
              {category.name} Products
            </h2>

            <p>
              Explore websites and digital products
              available in this category.
            </p>

          </div>

          <span className="category-product-count">
            {products.length} products
          </span>

        </div>


        {products.length === 0 ? (
          <div className="category-empty">

            <h3>
              No products available
            </h3>

            <p>
              There are currently no products in
              this category.
            </p>

            <Link to="/">
              Explore Marketplace
            </Link>

          </div>
        ) : (
          <div className="category-product-grid">

            {products.map((product) => (

              <article
                key={product._id}
                className="category-product-card"
              >

                <div className="category-product-image">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <div className="category-product-placeholder">

                      <span>
                        DIGITAL PRODUCT
                      </span>

                      <strong>
                        {product.name}
                      </strong>

                    </div>
                  )}

                </div>


                <div className="category-product-content">

                  <span className="category-product-type">
                    DIGITAL PRODUCT
                  </span>

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.description}
                  </p>


                  <div className="category-product-footer">

                    <div className="category-product-price">

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
                      className="category-product-button"
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


      {/* Footer */}

      <footer className="category-footer">

        <div className="category-footer-brand">

          <Link
            to="/"
            className="category-logo"
          >
            Market Palce
          </Link>

          <p>
            A premium marketplace for websites,
            templates, and digital products.
          </p>

        </div>


        <div className="category-footer-links">

          <Link to="/">
            Marketplace
          </Link>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

          <Link to="/account">
            Account
          </Link>

        </div>


        <div className="category-footer-bottom">

          © {new Date().getFullYear()} Market Palce

        </div>

      </footer>

    </main>
  )
}