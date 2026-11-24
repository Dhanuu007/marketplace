import {

  useEffect,

  useRef,

  useState,

} from 'react'



import { Link } from 'react-router-dom'

import MarketplaceAssistant from '../chatbot/MarketplaceAssistant'



import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { env } from '../../config/env.js'



import { apiRequest } from '../../../services/apiClient.js'

import { useAuth } from '../auth/useAuth.js'

import Credits from './Credits.jsx'

import MarketplaceHeroScene from './MarketplaceHeroScene.jsx'


import './foundation.css'





const DEFAULT_HOMEPAGE = {

  heading: 'Find Premium Websites for Your Business',



  description:

    'Discover professionally crafted websites, templates and digital products from trusted creators.',



  buttonText: 'Explore Websites',



  featuredCategoryIds: [],

  featuredProductIds: [],

  gallery: {
    isActive: false,
    images: [],
  },



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



const isNewWithinSevenDays = (date) => {
  if (!date) return false

  const createdTime = new Date(date).getTime()

  if (Number.isNaN(createdTime)) return false

  const age = Date.now() - createdTime

  return age >= 0 && age < 7 * 24 * 60 * 60 * 1000
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

  const gallerySectionRef = useRef(null)
  const galleryViewportRef = useRef(null)
  const galleryTrackRef = useRef(null)
  const galleryScrollTriggerRef = useRef(null)





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
  let loadingTimer
  const shimmerStartTime = Date.now()





    async function loadHomepage() {



      try {



        setLoading(true)

        setError('')





        const data = await apiRequest(
          '/website/homepage/public',
          token ? { token } : undefined,
        )

        // Payment maintenance settings are public, separate from homepage content.
        // If this request fails, the homepage should still load normally.
        let publicSettings = {}

        try {
          const settingsResponse = await apiRequest(
            '/website/settings/public',
          )

          publicSettings =
            settingsResponse?.settings ??
            settingsResponse ??
            {}
        } catch (settingsError) {
          console.warn(
            'Could not load public payment settings:',
            settingsError.message || settingsError,
          )
        }

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

            gallery: {
              ...DEFAULT_HOMEPAGE.gallery,
              ...(data.homepage.gallery ?? {}),
              images: Array.isArray(data.homepage.gallery?.images)
                ? data.homepage.gallery.images
                : [],
            },

            categories: data.homepage.categories ?? [],
            products: data.homepage.products ?? [],

            // Keep payments enabled by default if the public settings are missing.
            paymentsEnabled:
              publicSettings.paymentsEnabled ?? true,
            announcementEnabled:
              publicSettings.announcementEnabled ?? false,
            announcementMessage:
              publicSettings.announcementMessage ?? '',
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
        const elapsed = Date.now() - shimmerStartTime
        const remaining = Math.max(0, 1500 - elapsed)

        loadingTimer = setTimeout(() => {
          if (isMounted) {
            setLoading(false)
          }
        }, remaining)
      }




    }





    loadHomepage()





   return () => {
  isMounted = false
  clearTimeout(loadingTimer)
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



  /* =====================================================
     SCROLL-CONTROLLED HOMEPAGE GALLERY
  ====================================================== */

  useEffect(() => {
    const section = gallerySectionRef.current
    const viewport = galleryViewportRef.current
    const track = galleryTrackRef.current
    const images = homepage.gallery?.images ?? []

    if (!homepage.gallery?.isActive || images.length < 2 || !section || !viewport || !track) {
      return undefined
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia?.('(max-width: 700px)').matches
    if (reduceMotion || isMobile) return undefined

    gsap.registerPlugin(ScrollTrigger)

    let tween
    const setup = () => {
      if (tween) {
        tween.scrollTrigger?.kill()
        tween.kill()
      }

      const distance = Math.max(0, track.scrollWidth - viewport.clientWidth)
      if (!distance) return

      tween = gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
      galleryScrollTriggerRef.current = tween.scrollTrigger ?? null
    }

    const refreshTimer = window.setTimeout(() => {
      setup()
      ScrollTrigger.refresh()
    }, 80)

    const onLoad = () => {
      setup()
      ScrollTrigger.refresh()
    }
    track.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', onLoad, { once: true })
    })

    window.addEventListener('resize', setup)

    return () => {
      window.clearTimeout(refreshTimer)
      window.removeEventListener('resize', setup)
      track.querySelectorAll('img').forEach((img) => img.removeEventListener('load', onLoad))
      galleryScrollTriggerRef.current = null
      if (tween) {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    }
  }, [homepage.gallery?.isActive, homepage.gallery?.images, loading])


  function moveGallery(direction) {
    const viewport = galleryViewportRef.current
    const track = galleryTrackRef.current
    if (!viewport || !track) return

    const cardCount = track.children.length
    if (cardCount < 2) return

    const isMobile = window.matchMedia?.('(max-width: 700px)').matches
    if (isMobile) {
      const card = track.querySelector('.marketplace-scroll-gallery-card')
      const gap = 16
      viewport.scrollBy({
        left: direction * ((card?.getBoundingClientRect().width ?? viewport.clientWidth * 0.84) + gap),
        behavior: 'smooth',
      })
      return
    }

    const trigger = galleryScrollTriggerRef.current
    if (!trigger) return

    const currentIndex = Math.round(trigger.progress * (cardCount - 1))
    const nextIndex = Math.max(0, Math.min(cardCount - 1, currentIndex + direction))
    const targetTop = trigger.start + (nextIndex / (cardCount - 1)) * (trigger.end - trigger.start)
    window.scrollTo({ top: targetTop, behavior: 'smooth' })
  }


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
    gallery,
    paymentsEnabled = true,
    announcementEnabled = false,
    announcementMessage = '',
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

      {/* PAYMENT MAINTENANCE ANNOUNCEMENT */}
      {!paymentsEnabled &&
        announcementEnabled &&
        announcementMessage?.trim() && (
          <section
            className="marketplace-payment-announcement"
            role="status"
            aria-live="polite"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 24px',
                margin: '16px 24px 0',
                border: '1px solid #f2c078',
                borderRadius: '12px',
                background: darkMode ? '#3b2a16' : '#fff7e8',
                color: darkMode ? '#ffffff' : '#78350f',
                lineHeight: 1.5,
              }}

          >
            <span aria-hidden="true" style={{ fontSize: '22px' }}>⚠️</span>
            <p style={{ margin: 0 }}>{announcementMessage}</p>
          </section>
        )}






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

          
              <div
                className="marketplace-hero-visual marketplace-live-workflow marketplace-hero-3d"
                aria-label="3D preview of the website marketplace workflow"
              >
                <div className="marketplace-hero-3d-glow" />
                <MarketplaceHeroScene />
              </div>

        </section>
      )}


      {/* =====================================================
          SCROLL-CONTROLLED IMAGE GALLERY
      ====================================================== */}

      {gallery?.isActive && Array.isArray(gallery.images) && gallery.images.length > 0 && (
        <section
          ref={gallerySectionRef}
          className="marketplace-scroll-gallery"
          aria-label="Featured website gallery"
        >
          <div className="marketplace-scroll-gallery-inner">
            <div className="marketplace-scroll-gallery-heading">
              <span className="marketplace-section-label">A CLOSER LOOK</span>
              <h2>Explore what’s possible</h2>
              <p>Scroll to discover a collection of standout digital experiences.</p>
            </div>

            <div className="marketplace-scroll-gallery-viewport" ref={galleryViewportRef}>
              <button
                type="button"
                className="marketplace-scroll-gallery-arrow marketplace-scroll-gallery-arrow-left"
                onClick={() => moveGallery(-1)}
                aria-label="Previous gallery image"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                className="marketplace-scroll-gallery-arrow marketplace-scroll-gallery-arrow-right"
                onClick={() => moveGallery(1)}
                aria-label="Next gallery image"
              >
                <span aria-hidden="true">›</span>
              </button>
              <div className="marketplace-scroll-gallery-track" ref={galleryTrackRef}>
                {gallery.images
                  .filter((item) => item?.imageUrl)
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((item, index) => {
                    // Gallery uploads are served by the backend's /uploads route,
                    // not by the frontend's /api route. Resolve the image against
                    // the backend origin so the browser requests the correct host.
                    const imageSrc = (() => {
                      const rawImageUrl = String(item.imageUrl || '').trim()
                      if (/^https?:\/\//i.test(rawImageUrl)) return rawImageUrl

                      const configuredApiUrl = String(env.apiBaseUrl || '').trim()
                      let backendOrigin

                      try {
                        const apiUrl = new URL(configuredApiUrl || '/', window.location.origin)
                        backendOrigin = apiUrl.origin
                      } catch {
                        backendOrigin = window.location.origin
                      }

                      const normalizedImagePath = rawImageUrl.startsWith('/')
                        ? rawImageUrl
                        : `/${rawImageUrl}`

                      return new URL(normalizedImagePath, backendOrigin).toString()
                    })()

                    return (
                      <article className="marketplace-scroll-gallery-card" key={`${item.imageUrl}-${index}`}>
                        <div className="marketplace-scroll-gallery-image-wrap">
                          <img
                            src={imageSrc}
                            alt={item.title || `Featured gallery image ${index + 1}`}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            draggable="false"
                          />
                        </div>
                        {item.title && <h3>{item.title}</h3>}
                        <span className="marketplace-scroll-gallery-index">{String(index + 1).padStart(2, '0')}</span>
                      </article>
                    )
                  })}
              </div>
            </div>
            <div className="marketplace-scroll-gallery-hint" aria-hidden="true">
              <span>SCROLL TO EXPLORE</span><i />
            </div>
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

                      {isNewWithinSevenDays(category.createdAt) && (
                        <span className="marketplace-new-badge">
                          NEW
                        </span>
                      )}
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

                          <span
                            className="marketplace-india-flag"
                            role="img"
                            aria-label="Indian flag"
                          >
                            <span className="india-flag-chakra">☸</span>
                          </span>





                          <strong>

                            {product.name}

                          </strong>



                        </div>



                      )}





                      <span className="marketplace-product-badge">

                        FEATURED

                      </span>

                      {product.approvalStatus === 'APPROVED' &&
                          isNewWithinSevenDays(product.approvedAt) && (
                            <span className="marketplace-product-new-badge">
                              NEW
                            </span>
                          )}



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