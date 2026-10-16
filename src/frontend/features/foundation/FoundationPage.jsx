import {

  useEffect,

  useRef,

  useState,

} from 'react'



import { Link } from 'react-router-dom'

import MarketplaceAssistant from '../chatbot/MarketplaceAssistant'



import * as THREE from 'three'



import { apiRequest } from '../../../services/apiClient.js'

import { useAuth } from '../auth/useAuth.js'

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



  const { token } = useAuth()



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

            token ? { token } : undefined,

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



  }, [token])





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
          darkMode ? 'marketplace-dark' : 'marketplace-light'
        } marketplace-shimmer-page`}
        aria-busy="true"
        aria-label="Loading MarketPalce homepage"
      >
        <header className="marketplace-header marketplace-shimmer-header" aria-hidden="true">
          <div className="marketplace-header-left">
            <div className="marketplace-shimmer-brand-mark marketplace-skeleton" />
            <div className="marketplace-shimmer-brand-name marketplace-skeleton" />
            <div className="marketplace-shimmer-credits marketplace-skeleton" />
          </div>
          <div className="marketplace-shimmer-nav">
            <span className="marketplace-skeleton" />
            <span className="marketplace-skeleton" />
            <span className="marketplace-skeleton" />
            <span className="marketplace-skeleton" />
          </div>
          <div className="marketplace-shimmer-header-actions">
            <span className="marketplace-shimmer-search marketplace-skeleton" />
            <span className="marketplace-shimmer-login marketplace-skeleton" />
            <span className="marketplace-shimmer-button marketplace-skeleton" />
          </div>
        </header>

        <section className="marketplace-hero marketplace-hero-new marketplace-shimmer-hero" aria-hidden="true">
          <div className="marketplace-shimmer-hero-copy">
            <div className="marketplace-shimmer-pill marketplace-skeleton" />
            <div className="marketplace-shimmer-kicker marketplace-skeleton" />
            <div className="marketplace-shimmer-title">
              <span className="marketplace-skeleton" />
              <span className="marketplace-skeleton" />
            </div>
            <div className="marketplace-shimmer-description">
              <span className="marketplace-skeleton" />
              <span className="marketplace-skeleton" />
            </div>
            <div className="marketplace-shimmer-hero-buttons">
              <span className="marketplace-skeleton" />
              <span className="marketplace-skeleton" />
            </div>
            <div className="marketplace-shimmer-trust">
              <div><span className="marketplace-skeleton" /><span className="marketplace-skeleton" /></div>
              <div><span className="marketplace-skeleton" /><span className="marketplace-skeleton" /></div>
            </div>
          </div>

          <div className="marketplace-shimmer-hero-visual">
            <div className="marketplace-shimmer-workflow-card">
              <span className="marketplace-shimmer-line short" />
              <div className="marketplace-shimmer-file-row">
                <span className="marketplace-shimmer-file-icon marketplace-skeleton" />
                <div><span className="marketplace-shimmer-line medium" /><span className="marketplace-shimmer-line small" /></div>
              </div>
              <span className="marketplace-shimmer-progress marketplace-skeleton" />
              <span className="marketplace-shimmer-line medium" />
            </div>
            <div className="marketplace-shimmer-status marketplace-skeleton">
              <span />
              <div><i /><i /></div>
            </div>
            <div className="marketplace-shimmer-sale marketplace-skeleton">
              <i /><span />
            </div>
            <div className="marketplace-shimmer-download">
              <span className="marketplace-shimmer-line short" />
              <span className="marketplace-shimmer-line medium" />
              <span className="marketplace-shimmer-line long" />
              <span className="marketplace-shimmer-download-button marketplace-skeleton" />
            </div>
          </div>
        </section>

        <section className="marketplace-section marketplace-shimmer-section" aria-hidden="true">
          <div className="marketplace-shimmer-section-heading">
            <span className="marketplace-shimmer-line short marketplace-skeleton" />
            <span className="marketplace-shimmer-line heading marketplace-skeleton" />
            <span className="marketplace-shimmer-line description marketplace-skeleton" />
          </div>
          <div className="marketplace-shimmer-card-grid">
            <div className="marketplace-shimmer-category-card"><i className="marketplace-skeleton" /><span className="marketplace-skeleton" /><span className="marketplace-skeleton" /></div>
            <div className="marketplace-shimmer-category-card"><i className="marketplace-skeleton" /><span className="marketplace-skeleton" /><span className="marketplace-skeleton" /></div>
            <div className="marketplace-shimmer-category-card"><i className="marketplace-skeleton" /><span className="marketplace-skeleton" /><span className="marketplace-skeleton" /></div>
          </div>
        </section>

        <section className="marketplace-section marketplace-shimmer-products" aria-hidden="true">
          <div className="marketplace-shimmer-section-heading align-left">
            <span className="marketplace-shimmer-line short marketplace-skeleton" />
            <span className="marketplace-shimmer-line heading marketplace-skeleton" />
          </div>
          <div className="marketplace-shimmer-product-grid">
            <div className="marketplace-shimmer-product-card"><span /><i className="marketplace-skeleton" /><i className="marketplace-skeleton" /><b className="marketplace-skeleton" /></div>
            <div className="marketplace-shimmer-product-card"><span /><i className="marketplace-skeleton" /><i className="marketplace-skeleton" /><b className="marketplace-skeleton" /></div>
            <div className="marketplace-shimmer-product-card"><span /><i className="marketplace-skeleton" /><i className="marketplace-skeleton" /><b className="marketplace-skeleton" /></div>
          </div>
        </section>
        <p className="marketplace-shimmer-sr-only">Loading marketplace content…</p>
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



          <Link to="/how-it-works">

            How It Works

          </Link>



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
        <section className="marketplace-hero marketplace-hero-new">
          {/* Existing Three.js background — kept intact */}
          <div className="marketplace-live-background" aria-hidden="true"><canvas ref={heroCanvasRef} /></div>
          <div className="marketplace-hero-glow marketplace-hero-glow-one" />
          <div className="marketplace-hero-glow marketplace-hero-glow-two" />

          <div className="marketplace-hero-content marketplace-hero-copy">
            <div className="marketplace-eyebrow-row">
              <span className="marketplace-eyebrow">PREMIUM DIGITAL MARKETPLACE</span>
              <button type="button" className={`marketplace-theme-toggle ${darkMode ? 'dark' : ''}`} onClick={toggleTheme} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={darkMode}>
                <span className="marketplace-theme-icon"><canvas width="38" height="38" aria-hidden="true" /></span>
                <span className="marketplace-theme-label">{darkMode ? 'Dark' : 'Light'}</span>
              </button>
            </div>
            <span className="marketplace-hero-kicker">BIG IDEAS. SMALL FILES. ENDLESS POSSIBILITIES.</span>
            <h1>{heading}</h1>
            <p className="marketplace-hero-description">{description}</p>
            <div className="marketplace-hero-actions">
              <a href="#products" className="marketplace-primary-button">{buttonText || 'Explore Websites'} <span>→</span></a>
              <a href="#how-it-works" className="marketplace-secondary-button">See it in action</a>
            </div>
            <div className="marketplace-trust-row marketplace-trust-row-new">
              <div className="marketplace-trust-item"><span className="marketplace-trust-icon">✓</span><div><strong>No credit card needed</strong><span>Start exploring instantly</span></div></div>
              <div className="marketplace-trust-item"><span className="marketplace-trust-icon">◇</span><div><strong>Your work stays yours</strong><span>Built for creators</span></div></div>
            </div>
          </div>

          <div className="marketplace-hero-visual marketplace-live-workflow" aria-label="Live marketplace workflow animation">
            <div className="marketplace-workflow-grid" aria-hidden="true" /><div className="marketplace-workflow-glow" aria-hidden="true" />
            <div className="marketplace-workflow-card marketplace-upload-card">
              <div className="workflow-card-topline"><span>YOUR NEXT BIG THING</span><span className="workflow-live-dot">LIVE</span></div>
              <div className="workflow-file-row"><div className="workflow-file-icon">ZIP</div><div className="workflow-file-copy"><strong>studio-essentials.zip</strong><span>24 files · 48.6 MB</span></div></div>
              <div className="workflow-progress-track"><span className="workflow-progress-fill" /></div>
              <div className="workflow-upload-status"><span>Your creation is ready</span><strong>100%</strong></div>
            </div>
            <div className="workflow-line workflow-line-one" aria-hidden="true"><span /></div>
            <div className="workflow-status workflow-approved"><span className="workflow-status-icon">✓</span><div><strong>Approved</strong><span>Ready to sell</span></div></div>
            <div className="workflow-sale"><span className="workflow-sale-label">NEW SALE</span><strong>+₹2,400.00</strong><span className="workflow-sale-pulse" /></div>
            <div className="workflow-status workflow-payment"><span className="workflow-status-icon">₹</span><div><strong>Payment received</strong><span>Creator earnings updated</span></div></div>
            <div className="workflow-line workflow-line-two" aria-hidden="true"><span /></div>
            <div className="marketplace-download-card">
              <div className="download-card-header"><span>DESIGN ASSETS</span><span className="download-card-check">✓</span></div>
              <div className="download-card-title">Studio essentials</div><p>A little head start for your next big idea.</p>
              <div className="download-card-footer"><strong>₹2,400 INR</strong><button type="button" aria-label="Download your files">↓ Download your files ↗</button></div>
              <div className="download-card-ready">✓ Your files are ready.</div>
            </div>
            <div className="marketplace-workflow-zip" aria-hidden="true"><span>ZIP</span></div>
            <div className="workflow-block workflow-block-one" aria-hidden="true" /><div className="workflow-block workflow-block-two" aria-hidden="true" />
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

                            {product.price != null

                              ? `₹${Number(

                                  product.price,

                                ).toLocaleString(

                                  'en-IN',

                                )}`

                              : 'Login to view price'}

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





      {/* =====================================================

          MARKETPLACE AI ASSISTANT

      ====================================================== */}



      <MarketplaceAssistant />



    </main>



  )



}





export default FoundationPage