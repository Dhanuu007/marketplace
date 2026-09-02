import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import * as THREE from 'three'

import { apiRequest } from '../../../services/apiClient.js'
import Credits from './Credits.jsx'

import './foundation.css'


const DEFAULT_HOMEPAGE = {
  heading: 'Find Premium Websites for Your Business',

  description:
    'Discover professionally crafted websites, templates and digital products from trusted creators.',

  buttonText: 'Explore Websites',

  featuredCategoryIds: [],
  featuredProductIds: [],

  banner: {
    label: 'PROMOTION',

    heading:
      'Build your online presence today.',

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

  /* =====================================================
     HOMEPAGE STATE
  ====================================================== */

  const [homepage, setHomepage] =
    useState(DEFAULT_HOMEPAGE)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [showCredits, setShowCredits] =
    useState(false)


  /* =====================================================
     THEME STATE
  ====================================================== */

  const [darkMode, setDarkMode] =
    useState(() => {
      return (
        localStorage.getItem(
          'marketplace-theme',
        ) === 'dark'
      )
    })


  /* =====================================================
     BACK TO TOP STATE
  ====================================================== */

  const [showBackToTop, setShowBackToTop] =
    useState(false)


  /* =====================================================
     THREE.JS HERO REF
  ====================================================== */

  const heroCanvasRef =
    useRef(null)


  /* =====================================================
     THEME TOGGLE
  ====================================================== */

  function toggleTheme() {
    setDarkMode((current) => !current)
  }


  /* =====================================================
     LOAD HOMEPAGE
  ====================================================== */

  useEffect(() => {

    let isMounted = true


    async function loadHomepage() {

      try {

        setLoading(true)
        setError('')


        const data =
          await apiRequest(
            '/website/homepage/public',
          )


        if (
          isMounted &&
          data?.homepage
        ) {

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
              data.homepage.categories ??
              [],

            products:
              data.homepage.products ??
              [],

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


  /* =====================================================
     APPLY THEME
  ====================================================== */

  useEffect(() => {

    document.documentElement.dataset.theme =
      darkMode
        ? 'dark'
        : 'light'


    localStorage.setItem(
      'marketplace-theme',
      darkMode
        ? 'dark'
        : 'light',
    )

  }, [darkMode])


  /* =====================================================
     LIVE HERO BACKGROUND
  ====================================================== */

  useEffect(() => {

    const canvas =
      heroCanvasRef.current


    if (!canvas) {
      return undefined
    }


    const scene =
      new THREE.Scene()


    const camera =
      new THREE.PerspectiveCamera(
        45,
        1,
        0.1,
        100,
      )


    camera.position.z = 5


    const renderer =
      new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      })


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        2,
      ),
    )


    function resizeRenderer() {

      const parent =
        canvas.parentElement

      if (!parent) {
        return
      }

      const width =
        parent.clientWidth || 600

      const height =
        parent.clientHeight || 500


      renderer.setSize(
        width,
        height,
        false,
      )


      camera.aspect =
        width / height

      camera.updateProjectionMatrix()

    }


    resizeRenderer()


    window.addEventListener(
      'resize',
      resizeRenderer,
    )


    /* =================================================
       PARTICLE FIELD
    ================================================== */

    const particleCount = 260


    const positions =
      new Float32Array(
        particleCount * 3,
      )


    const scales =
      new Float32Array(
        particleCount,
      )


    for (
      let index = 0;
      index < particleCount;
      index += 1
    ) {

      const i =
        index * 3


      positions[i] =
        (Math.random() - 0.5) * 9

      positions[i + 1] =
        (Math.random() - 0.5) * 6

      positions[i + 2] =
        (Math.random() - 0.5) * 4


      scales[index] =
        0.5 +
        Math.random() * 1.5

    }


    const particleGeometry =
      new THREE.BufferGeometry()


    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    )


    particleGeometry.setAttribute(
      'aScale',
      new THREE.BufferAttribute(
        scales,
        1,
      ),
    )


    const particleMaterial =
      new THREE.PointsMaterial({

        color:
          darkMode
            ? 0x8b5cf6
            : 0x6366f1,

        size:
          darkMode
            ? 0.045
            : 0.035,

        transparent: true,

        opacity:
          darkMode
            ? 0.72
            : 0.48,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

      })


    const particles =
      new THREE.Points(
        particleGeometry,
        particleMaterial,
      )


    scene.add(particles)


    /* =================================================
       GLOWING ORBS
    ================================================== */

    const orbGeometry =
      new THREE.SphereGeometry(
        0.55,
        32,
        32,
      )


    const orbMaterialOne =
      new THREE.MeshBasicMaterial({
        color:
          darkMode
            ? 0x6366f1
            : 0x818cf8,

        transparent: true,

        opacity:
          darkMode
            ? 0.16
            : 0.11,
      })


    const orbMaterialTwo =
      new THREE.MeshBasicMaterial({
        color:
          darkMode
            ? 0xa855f7
            : 0xc084fc,

        transparent: true,

        opacity:
          darkMode
            ? 0.13
            : 0.09,
      })


    const orbOne =
      new THREE.Mesh(
        orbGeometry,
        orbMaterialOne,
      )


    const orbTwo =
      new THREE.Mesh(
        orbGeometry,
        orbMaterialTwo,
      )


    orbOne.position.set(
      1.8,
      0.9,
      -0.7,
    )


    orbTwo.position.set(
      -2.1,
      -0.8,
      -0.9,
    )


    orbOne.scale.set(
      2.4,
      2.4,
      2.4,
    )


    orbTwo.scale.set(
      2.8,
      2.8,
      2.8,
    )


    scene.add(orbOne)
    scene.add(orbTwo)


    /* =================================================
       FLOATING WIREFRAME SHAPE
    ================================================== */

    const shapeGeometry =
      new THREE.IcosahedronGeometry(
        1.25,
        1,
      )


    const shapeMaterial =
      new THREE.MeshBasicMaterial({

        color:
          darkMode
            ? 0x8b5cf6
            : 0x6366f1,

        wireframe: true,

        transparent: true,

        opacity:
          darkMode
            ? 0.25
            : 0.16,

      })


    const floatingShape =
      new THREE.Mesh(
        shapeGeometry,
        shapeMaterial,
      )


    floatingShape.position.set(
      1.3,
      0.15,
      -0.2,
    )


    floatingShape.rotation.set(
      0.4,
      0.5,
      0.2,
    )


    scene.add(
      floatingShape,
    )


    /* =================================================
       ANIMATION
    ================================================== */

    let animationFrame

    const clock =
      new THREE.Clock()


    function animate() {

      const elapsed =
        clock.getElapsedTime()


      particles.rotation.y =
        elapsed * 0.025

      particles.rotation.x =
        Math.sin(elapsed * 0.18) *
        0.035


      floatingShape.rotation.x =
        elapsed * 0.18

      floatingShape.rotation.y =
        elapsed * 0.25

      floatingShape.rotation.z =
        elapsed * 0.08


      floatingShape.position.y =
        0.15 +
        Math.sin(
          elapsed * 0.9,
        ) * 0.15


      orbOne.position.x =
        1.8 +
        Math.sin(
          elapsed * 0.45,
        ) * 0.35


      orbOne.position.y =
        0.9 +
        Math.cos(
          elapsed * 0.55,
        ) * 0.22


      orbTwo.position.x =
        -2.1 +
        Math.cos(
          elapsed * 0.38,
        ) * 0.3


      orbTwo.position.y =
        -0.8 +
        Math.sin(
          elapsed * 0.48,
        ) * 0.2


      renderer.render(
        scene,
        camera,
      )


      animationFrame =
        requestAnimationFrame(
          animate,
        )

    }


    animate()


    /* =================================================
       CLEANUP
    ================================================== */

    return () => {

      cancelAnimationFrame(
        animationFrame,
      )


      window.removeEventListener(
        'resize',
        resizeRenderer,
      )


      particleGeometry.dispose()
      particleMaterial.dispose()

      orbGeometry.dispose()
      orbMaterialOne.dispose()
      orbMaterialTwo.dispose()

      shapeGeometry.dispose()
      shapeMaterial.dispose()

      renderer.dispose()

    }

  }, [darkMode])


  /* =====================================================
     BACK TO TOP / SCROLL DETECTION
  ====================================================== */

  useEffect(() => {

    function handleScroll() {

      setShowBackToTop(
        window.scrollY > 350,
      )

    }


    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      },
    )


    handleScroll()


    return () => {

      window.removeEventListener(
        'scroll',
        handleScroll,
      )

    }

  }, [])


  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {

    return (
      <main
        className={`marketplace-homepage ${
          darkMode
            ? 'marketplace-dark'
            : 'marketplace-light'
        }`}
      >

        <section className="marketplace-loading">

          <div className="marketplace-loading-spinner" />

          <p>
            Loading marketplace...
          </p>

        </section>

      </main>
    )

  }


  /* =====================================================
     ERROR
  ====================================================== */

  if (error) {

    return (
      <main
        className={`marketplace-homepage ${
          darkMode
            ? 'marketplace-dark'
            : 'marketplace-light'
        }`}
      >

        <section className="marketplace-error">

          <span className="marketplace-error-label">
            MARKETPLACE
          </span>


          <h1>
            Something went wrong
          </h1>


          <p>
            {error}
          </p>


          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </section>

      </main>
    )

  }


  /* =====================================================
     HOMEPAGE DATA
  ====================================================== */

  const {
    heading,
    description,
    buttonText,
    banner,
    sections,
    categories,
    products,
  } = homepage


  /* =====================================================
     PAGE
  ====================================================== */

  return (

    <main
      className={`marketplace-homepage ${
        darkMode
          ? 'marketplace-dark'
          : 'marketplace-light'
      }`}
    >

      {/* =================================================
          HEADER
      ================================================== */}

      <header className="marketplace-header">

        <div className="marketplace-header-left">

          <Link
            to="/"
            className="marketplace-logo"
          >

            <span className="marketplace-logo-mark">
              M
            </span>

            <span>
              MarketPalce
            </span>

          </Link>


          <button
            type="button"
            className="marketplace-header-credits"
            onClick={() =>
              setShowCredits(true)
            }
          >
            Credits
          </button>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================== */}

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

          <a href="#creators">
            Creators
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

        </nav>


        {/* =================================================
            HEADER ACTIONS
        ================================================== */}

        <div className="marketplace-header-actions">

          <button
            type="button"
            className="marketplace-search-button"
            aria-label="Search"
          >

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >

              <circle
                cx="11"
                cy="11"
                r="6.5"
              />

              <path d="M16 16L21 21" />

            </svg>

          </button>


          <Link
            to="/login"
            className="marketplace-login-link"
          >
            Log in
          </Link>


          <Link
            to="/register"
            className="marketplace-header-button"
          >
            Get Started
          </Link>

        </div>

      </header>


      {/* =====================================================
          HERO
      ====================================================== */}

      {sections.hero && (

        <section className="marketplace-hero">

          {/* LIVE THREE.JS BACKGROUND */}

          <div
            className="marketplace-live-background"
            aria-hidden="true"
          >

            <canvas
              ref={heroCanvasRef}
            />

          </div>


          {/* DECORATIVE GRADIENTS */}

          <div className="marketplace-hero-glow marketplace-hero-glow-one" />

          <div className="marketplace-hero-glow marketplace-hero-glow-two" />


          {/* HERO CONTENT */}

          <div className="marketplace-hero-content">


            {/* =================================================
                EYEBROW + THEME SWITCH
            ================================================== */}

            <div className="marketplace-eyebrow-row">

              <span className="marketplace-eyebrow">
                PREMIUM DIGITAL MARKETPLACE
              </span>


              <button
                type="button"
                className={`marketplace-theme-toggle ${
                  darkMode
                    ? 'dark'
                    : ''
                }`}
                onClick={toggleTheme}
                aria-label={
                  darkMode
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                aria-pressed={darkMode}
              >

                <span className="marketplace-theme-icon">

                  <canvas
                    width="38"
                    height="38"
                    aria-hidden="true"
                  />

                </span>


                <span className="marketplace-theme-label">

                  {darkMode
                    ? 'Dark'
                    : 'Light'}

                </span>

              </button>

            </div>


            <h1>
              {heading}
            </h1>


            <p className="marketplace-hero-description">
              {description}
            </p>


            <div className="marketplace-hero-actions">

              <a
                href="#products"
                className="marketplace-primary-button"
              >

                {buttonText}

                <span>
                  →
                </span>

              </a>


              <a
                href="#categories"
                className="marketplace-secondary-button"
              >
                Browse Categories
              </a>

            </div>


            {/* =================================================
                TRUST ROW
            ================================================== */}

            <div className="marketplace-trust-row">

              <div className="marketplace-trust-item">

                <span className="marketplace-trust-icon">
                  ✓
                </span>

                <div>

                  <strong>
                    Quality Verified
                  </strong>

                  <span>
                    Every item is checked
                  </span>

                </div>

              </div>


              <div className="marketplace-trust-item">

                <span className="marketplace-trust-icon">
                  ◇
                </span>

                <div>

                  <strong>
                    Secure Payment
                  </strong>

                  <span>
                    Safe checkout
                  </span>

                </div>

              </div>


              <div className="marketplace-trust-item">

                <span className="marketplace-trust-icon">
                  ⚡
                </span>

                <div>

                  <strong>
                    Instant Access
                  </strong>

                  <span>
                    Download immediately
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              HERO VISUAL
          ================================================== */}

          <div className="marketplace-hero-visual">

            <div className="marketplace-hero-visual-grid" />


            <div className="marketplace-orbit marketplace-orbit-one" />

            <div className="marketplace-orbit marketplace-orbit-two" />


            <div className="marketplace-3d-card marketplace-3d-card-back">

              <div />
              <div />
              <div />

            </div>


            <div className="marketplace-3d-card marketplace-3d-card-main">

              <div className="marketplace-preview-browser">

                <div className="marketplace-browser-top">

                  <span />
                  <span />
                  <span />

                </div>


                <div className="marketplace-browser-content">

                  <div className="marketplace-browser-brand">
                    DIGITAL STUDIO
                  </div>


                  <div className="marketplace-browser-title">

                    We Create
                    <br />
                    Digital Experiences

                  </div>


                  <div className="marketplace-browser-button">
                    View Website
                  </div>

                </div>

              </div>


              <div className="marketplace-3d-card-info">

                <div>

                  <span>
                    WEBSITE TEMPLATE
                  </span>


                  <strong>
                    Creative Agency
                  </strong>

                </div>


                <strong className="marketplace-visual-price">
                  ₹₹₹₹
                </strong>

              </div>

            </div>


            <div className="marketplace-floating-card marketplace-floating-card-top">

              <span>
                FEATURED
              </span>


              <strong>
                Websites
              </strong>

            </div>


            <div className="marketplace-floating-card marketplace-floating-card-bottom">

              <span>
                STARTING FROM
              </span>


              <strong>
                ₹₹₹₹
              </strong>

            </div>


            <div className="marketplace-3d-shape marketplace-shape-one" />

            <div className="marketplace-3d-shape marketplace-shape-two" />

          </div>

        </section>

      )}




      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      {sections.categories && (

        <section
          id="categories"
          className="marketplace-section marketplace-categories-section"
        >

          <div className="marketplace-centered-heading">

            <span className="marketplace-section-label">
              POPULAR CATEGORIES
            </span>


            <h2>
              Browse Top Categories
            </h2>


            <p>
              Find the right website solution for your
              business, portfolio, store, or next idea.
            </p>

          </div>


          {categories.length === 0 ? (

            <div className="marketplace-empty-state">

              <h3>
                No categories available yet
              </h3>


              <p>
                Featured categories will appear here once
                they are selected by the administrator.
              </p>

            </div>

          ) : (

            <div className="marketplace-category-grid">

              {categories.map(
                (category, index) => (

                  <Link
                    key={category._id}
                    to={`/category/${category.slug}`}
                    className="marketplace-category-card"
                  >

                    <div className="marketplace-category-icon">

                      <span>
                        {category.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>

                    </div>


                    <div className="marketplace-category-card-content">

                      <span className="marketplace-category-index">
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          '0',
                        )}
                      </span>


                      <h3>
                        {category.name}
                      </h3>


                      <p>
                        {category.description ||
                          'Explore premium digital products.'}
                      </p>


                      <span className="marketplace-category-link">
                        Explore →
                      </span>

                    </div>

                  </Link>

                ),
              )}

            </div>

          )}

        </section>

      )}


      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      {sections.products && (

        <section
          id="products"
          className="marketplace-section marketplace-products-section"
        >

          <div className="marketplace-section-heading-row">

            <div>

              <span className="marketplace-section-label">
                CURATED FOR YOU
              </span>


              <h2>
                Featured Products
              </h2>


              <p>
                Premium websites and digital products
                selected for the marketplace.
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
                Featured products will appear here once
                they are selected by the administrator.
              </p>

            </div>

          ) : (

            <div className="marketplace-product-grid">

              {products.map(
                (product) => (

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
                            MARKETPALCE
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
                        {product.description ||
                          'Premium digital product from a trusted creator.'}
                      </p>


                      <div className="marketplace-product-footer">

                        <div>

                          <span>
                            Price
                          </span>


                          <strong>
                            ₹{Number(
                              product.price ?? 0,
                            ).toLocaleString(
                              'en-IN',
                            )}
                          </strong>

                        </div>


                        <Link
                          to={`/product/${product._id}`}
                          className="marketplace-product-view-button"
                        >
                          View Product →
                        </Link>

                      </div>

                    </div>

                  </article>

                ),
              )}

            </div>

          )}

        </section>

      )}


      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className="marketplace-how-it-works"
      >

        <div className="marketplace-centered-heading">

          <span className="marketplace-section-label">
            SIMPLE & SECURE
          </span>


          <h2>
            How Marketplace Works
          </h2>


          <p>
            Discover, purchase and get instant access
            to premium digital products.
          </p>

        </div>


        <div className="marketplace-steps">

          <div className="marketplace-step">

            <span>
              01
            </span>


            <h3>
              Explore
            </h3>


            <p>
              Browse premium websites, templates and
              digital products.
            </p>

          </div>


          <div className="marketplace-step">

            <span>
              02
            </span>


            <h3>
              Purchase
            </h3>


            <p>
              Complete your purchase through our secure
              checkout.
            </p>

          </div>


          <div className="marketplace-step">

            <span>
              03
            </span>


            <h3>
              Get Access
            </h3>


            <p>
              Download your purchased product immediately.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROMOTION
      ====================================================== */}

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

                <span>
                  →
                </span>

              </a>

            </div>


            <div className="marketplace-promotion-decoration">

              <div />
              <div />
              <div />

            </div>

          </section>

        )}


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="marketplace-footer">

        <div className="marketplace-footer-main">

          <div className="marketplace-footer-brand">

            <Link
              to="/"
              className="marketplace-logo"
            >

              <span className="marketplace-logo-mark">
                M
              </span>


              <span>
                MarketPalce
              </span>

            </Link>


            <p>
              A premium marketplace for websites,
              templates and digital products.
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

        </div>


        <div className="marketplace-footer-bottom">

          <span>
            © {new Date().getFullYear()} MarketPalce
          </span>


          <span>
            Premium digital marketplace
          </span>


          <button
            type="button"
            className="marketplace-credits-button"
            onClick={() =>
              setShowCredits(true)
            }
          >
            Credits
          </button>

        </div>

      </footer>


      {/* =====================================================
          CREDITS MODAL
      ====================================================== */}

      {showCredits && (

        <Credits
          onClose={() =>
            setShowCredits(false)
          }
        />

      )}


      {/* =====================================================
          BACK TO TOP
      ====================================================== */}

      {showBackToTop && (

        <button
          type="button"
          className="marketplace-back-to-top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }
          aria-label="Back to top"
        >

          <span>
            ↑
          </span>

        </button>

      )}

    </main>

  )

}


export default FoundationPage