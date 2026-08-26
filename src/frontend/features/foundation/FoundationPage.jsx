import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { apiRequest } from '../../../services/apiClient.js'
import Credits from './Credits.jsx'

import './foundation.css'


const DEFAULT_HOMEPAGE = {
  heading: 'Find the perfect website for your business',
  description:
    'Discover premium websites, templates, and digital products from trusted sellers.',
  buttonText: 'Explore Websites',

  featuredCategoryIds: [],
  featuredProductIds: [],

  banner: {
    label: 'PROMOTION',
    heading: 'Build your online presence today.',
    description:
      'Discover premium websites from our marketplace.',
    buttonText: 'Explore Now',
    isActive: true,
  },

  sections: {
    hero: true,
    categories: true,
    products: true,
    banner: true,
  },

  categories: [],
  products: [],
}


export function FoundationPage() {
  const [homepage, setHomepage] = useState(DEFAULT_HOMEPAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCredits, setShowCredits] = useState(false)


  useEffect(() => {
    let isMounted = true

    async function loadHomepage() {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest(
          '/website/homepage/public',
        )

        if (isMounted && data?.homepage) {
          setHomepage({
            ...DEFAULT_HOMEPAGE,
            ...data.homepage,

            banner: {
              ...DEFAULT_HOMEPAGE.banner,
              ...(data.homepage.banner ?? {}),
            },

            sections: {
              ...DEFAULT_HOMEPAGE.sections,
              ...(data.homepage.sections ?? {}),
            },

            categories:
              data.homepage.categories ?? [],

            products:
              data.homepage.products ?? [],
          })
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message ||
              'Failed to load marketplace homepage.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadHomepage()

    return () => {
      isMounted = false
    }
  }, [])


  if (loading) {
    return (
      <main className="marketplace-homepage">
        <section className="marketplace-loading">
          <div className="marketplace-loading-spinner" />

          <p>Loading marketplace...</p>
        </section>
      </main>
    )
  }


  if (error) {
    return (
      <main className="marketplace-homepage">
        <section className="marketplace-error">
          <span className="marketplace-error-label">
            Marketplace
          </span>

          <h1>Something went wrong</h1>

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


  const {
    heading,
    description,
    buttonText,
    banner,
    sections,
    categories,
    products,
  } = homepage


  return (
    <main className="marketplace-homepage">

      {/* =========================
          HEADER
      ========================== */}

      <header className="marketplace-header">

        <Link
          to="/"
          className="marketplace-logo"
        >
          Market Palce
        </Link>

        <button
          type="button"
          className="marketplace-header-credits"
          onClick={() => setShowCredits(true)}
        >
          Credits
        </button>

        <nav
          className="marketplace-nav"
          aria-label="Main navigation"
        >
          <a href="#categories">
            Categories
          </a>

          <a href="#products">
            Products
          </a>

          <a href="#promotion">
            Offers
          </a>

          <Link to="/account">
            Account
          </Link>
        </nav>

        <div className="marketplace-header-actions">

          <Link
            to="/login"
            className="marketplace-login-link"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="marketplace-header-button"
          >
            Get Started
          </Link>

        </div>

      </header>


      {/* =========================
          HERO
      ========================== */}

      {sections.hero && (
        <section className="marketplace-hero">

          <div className="marketplace-hero-content">

            <span className="marketplace-eyebrow">
              PREMIUM DIGITAL MARKETPLACE
            </span>

            <h1>
              {heading}
            </h1>

            <p>
              {description}
            </p>

            <div className="marketplace-hero-actions">

              <a
                href="#products"
                className="marketplace-primary-button"
              >
                {buttonText}
              </a>

              <a
                href="#categories"
                className="marketplace-secondary-button"
              >
                Browse Categories
              </a>

            </div>

            <div className="marketplace-hero-stats">

              <div>
                <strong>
                  {categories.length}
                </strong>

                <span>
                  Featured Categories
                </span>
              </div>

              <div>
                <strong>
                  {products.length}
                </strong>

                <span>
                  Featured Products
                </span>
              </div>

              <div>
                <strong>
                  100%
                </strong>

                <span>
                  Quality Focused
                </span>
              </div>

            </div>

          </div>


          <div className="marketplace-hero-visual">

            <div className="marketplace-hero-card marketplace-hero-card-main">

              <span className="marketplace-card-badge">
                FEATURED
              </span>

              <div className="marketplace-card-preview">
                <div />
                <div />
                <div />
              </div>

              <div className="marketplace-card-lines">
                <span />
                <span />
                <span />
              </div>

            </div>


            <div className="marketplace-floating-card marketplace-floating-card-one">
              <span>Premium</span>
              <strong>Websites</strong>
            </div>


            <div className="marketplace-floating-card marketplace-floating-card-two">
              <span>Starting from</span>
              <strong>â‚¹4,999</strong>
            </div>

          </div>

        </section>
      )}


      {/* =========================
          FEATURED CATEGORIES
      ========================== */}

      {sections.categories && (
        <section
          id="categories"
          className="marketplace-section marketplace-categories-section"
        >

          <div className="marketplace-section-header">

            <div>
              <span className="marketplace-section-label">
                EXPLORE
              </span>

              <h2>
                Featured Categories
              </h2>

              <p>
                Explore curated website solutions for different
                business and creative needs.
              </p>
            </div>

            <span className="marketplace-section-count">
              {categories.length} categories
            </span>

          </div>


          {categories.length === 0 ? (
            <div className="marketplace-empty-state">
              <h3>
                No featured categories yet
              </h3>

              <p>
                Featured categories will appear here once
                they are selected by the administrator.
              </p>
            </div>
          ) : (
            <div className="marketplace-category-grid">

              {categories.map((category, index) => (
              <article
                key={category._id}
                className="marketplace-category-card"
              >

                <div className="marketplace-category-number">
                  0{index + 1}
                </div>

                <div className="marketplace-category-icon">
                  {category.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.description}
                </p>

                <Link
                  to={`/category/${category.slug}`}
                  className="marketplace-category-link"
                >
                  Explore category â†’
                </Link>

              </article>
            ))}

            </div>
          )}

        </section>
      )}


      {/* =========================
          FEATURED PRODUCTS
      ========================== */}

      {sections.products && (
        <section
          id="products"
          className="marketplace-section marketplace-products-section"
        >

          <div className="marketplace-section-header">

            <div>
              <span className="marketplace-section-label">
                MARKETPLACE
              </span>

              <h2>
                Featured Products
              </h2>

              <p>
                Discover premium website templates and digital
                products selected for our marketplace.
              </p>
            </div>

            <span className="marketplace-section-count">
              {products.length} products
            </span>

          </div>


          {products.length === 0 ? (
            <div className="marketplace-empty-state">
              <h3>
                No featured products yet
              </h3>

              <p>
                Featured products will appear here once they
                are selected by the administrator.
              </p>
            </div>
          ) : (
            <div className="marketplace-product-grid">

              {products.map((product) => (
                <article
                  key={product._id}
                  className="marketplace-product-card"
                >

                  <div className="marketplace-product-image">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <div className="marketplace-product-placeholder">

                        <span>
                          MARKET
                        </span>

                        <strong>
                          {product.name}
                        </strong>

                      </div>
                    )}

                    <span className="marketplace-product-badge">
                      FEATURED
                    </span>

                  </div>


                  <div className="marketplace-product-content">

                    <span className="marketplace-product-category">
                      DIGITAL PRODUCT
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      {product.description}
                    </p>

                    <div className="marketplace-product-footer">

                      <div>
                        <span>
                          Price
                        </span>

                        <strong>
                          â‚¹{Number(
                            product.price,
                          ).toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <Link
                        to={`/product/${product._id}`}
                        className="marketplace-product-view-button"
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
      )}


      {/* =========================
          PROMOTIONAL BANNER
      ========================== */}

      {sections.banner &&
        banner?.isActive && (
          <section
            id="promotion"
            className="marketplace-promotion"
          >

            <div className="marketplace-promotion-content">

              <span className="marketplace-promotion-label">
                {banner.label}
              </span>

              <h2>
                {banner.heading}
              </h2>

              <p>
                {banner.description}
              </p>

              <a
                href="#products"
                className="marketplace-promotion-button"
              >
                {banner.buttonText}
              </a>

            </div>


            <div className="marketplace-promotion-decoration">

              <div />
              <div />
              <div />

            </div>

          </section>
        )}


      {/* =========================
          FOOTER
      ========================== */}

      <footer className="marketplace-footer">

        <div className="marketplace-footer-brand">

          <Link
            to="/"
            className="marketplace-logo"
          >
            Market Palce
          </Link>

          <p>
            A premium marketplace for websites,
            templates, and digital products.
          </p>

        </div>


        <div className="marketplace-footer-links">

          <div>
            <strong>
              Marketplace
            </strong>

            <a href="#categories">
              Categories
            </a>

            <a href="#products">
              Products
            </a>

            <a href="#promotion">
              Offers
            </a>
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


        <div className="marketplace-footer-bottom">

            <span>
              Â© {new Date().getFullYear()} Market Palce
            </span>

            <span>
              Premium digital marketplace
            </span>

            <button
              type="button"
              className="marketplace-credits-button"
              onClick={() => setShowCredits(true)}
            >
              Credits
            </button>

          </div>


      </footer>

      {showCredits && (
  <Credits
    onClose={() => setShowCredits(false)}
  />
)}


    </main>

  )
}
