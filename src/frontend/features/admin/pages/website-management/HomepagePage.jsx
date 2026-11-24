import { useEffect, useState } from 'react'

import { AdminLayout } from '../../components/AdminLayout.jsx'

import { useAuth } from '../../../auth/useAuth.js'
import { apiRequest } from '../../../../../services/apiClient.js'
import { env } from '../../../../config/env.js'

import './HomepagePage.css'


const DEFAULT_HOMEPAGE = {
  heading:
    'Find the perfect website for your business',

  description:
    'Discover premium websites, templates, and digital products from trusted sellers.',

  buttonText:
    'Explore Websites',
}


const DEFAULT_BANNER = {
  label: 'PROMOTION',

  heading:
    'Build your online presence today.',

  description:
    'Discover premium websites from our marketplace.',

  buttonText:
    'Explore Now',

  isActive: true,
}


const DEFAULT_SECTIONS = {
  hero: true,
  categories: true,
  products: true,
  banner: true,
}


const DEFAULT_PRICE_VISIBILITY = {
  loginRequired: false,
}

const DEFAULT_GALLERY = {
  isActive: false,
  images: [],
}


// Resolve relative gallery paths against the configured backend origin.
// In production this points to Railway; locally it keeps using the Vite proxy.
const getGalleryImageUrl = (imageUrl) => {
  const rawUrl = String(imageUrl || '').trim()

  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl

  const configuredApiUrl = String(env.apiBaseUrl || '').trim()
  const apiUrl = new URL(configuredApiUrl || '/', window.location.origin)
  const imagePath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`

  return new URL(imagePath, apiUrl.origin).toString()
}


function HomepagePage() {
  const { token } = useAuth()


  const [homepage, setHomepage] =
    useState(DEFAULT_HOMEPAGE)


  const [banner, setBanner] =
    useState(DEFAULT_BANNER)


  const [categories, setCategories] =
    useState([])


  const [products, setProducts] =
    useState([])


  const [selectedCategoryIds, setSelectedCategoryIds] =
    useState([])


  const [selectedProductIds, setSelectedProductIds] =
    useState([])


  const [sections, setSections] =
    useState(DEFAULT_SECTIONS)


  const [priceVisibility, setPriceVisibility] =
    useState(DEFAULT_PRICE_VISIBILITY)

  const [gallery, setGallery] = useState(DEFAULT_GALLERY)
  const [galleryUploading, setGalleryUploading] = useState(false)

    


  const [loading, setLoading] =
    useState(true)


  const [saving, setSaving] =
    useState(false)


  const [error, setError] =
    useState('')


  const [success, setSuccess] =
    useState('')


  useEffect(() => {
    async function loadHomepage() {
      if (!token) {
        setLoading(false)
        return
      }


      try {
        setLoading(true)
        setError('')
        setSuccess('')


        const [
          homepageData,
          categoryData,
          productData,
        ] = await Promise.all([
          apiRequest(
            '/website/homepage',
            {
              token,
            },
          ),

          apiRequest(
            '/categories',
            {
              token,
            },
          ),

          apiRequest(
            '/products/public',
            {
              token,
            },
          ),
        ])


        if (homepageData?.homepage) {
          const savedHomepage =
            homepageData.homepage


          setBanner({
            ...DEFAULT_BANNER,
            ...(savedHomepage.banner ?? {}),
          })


          setHomepage({
            heading:
              savedHomepage.heading ??
              DEFAULT_HOMEPAGE.heading,

            description:
              savedHomepage.description ??
              DEFAULT_HOMEPAGE.description,

            buttonText:
              savedHomepage.buttonText ??
              DEFAULT_HOMEPAGE.buttonText,
          })


          setSelectedCategoryIds(
            Array.isArray(
              savedHomepage.featuredCategoryIds,
            )
              ? savedHomepage.featuredCategoryIds.map(String)
              : [],
          )


          setSelectedProductIds(
            Array.isArray(
              savedHomepage.featuredProductIds,
            )
              ? savedHomepage.featuredProductIds.map(String)
              : [],
          )


          setSections({
            hero:
              savedHomepage.sections?.hero ??
              true,

            categories:
              savedHomepage.sections?.categories ??
              true,

            products:
              savedHomepage.sections?.products ??
              true,

            banner:
              savedHomepage.sections?.banner ??
              true,
          })


          setPriceVisibility({
            ...DEFAULT_PRICE_VISIBILITY,
            ...(savedHomepage.priceVisibility ?? {}),
          })

          setGallery({
  ...DEFAULT_GALLERY,
  ...(savedHomepage.gallery ?? {}),
  images: Array.isArray(savedHomepage.gallery?.images)
    ? savedHomepage.gallery.images
    : [],
})

          
        }


        

        setCategories(
          Array.isArray(
            categoryData?.categories,
          )
            ? categoryData.categories
            : [],
        )


        setProducts(
          Array.isArray(
            productData?.products,
          )
            ? productData.products
            : [],
        )
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Failed to load homepage content.',
        )
      } finally {
        setLoading(false)
      }
    }


    loadHomepage()
  }, [token])


  const toggleSection = (section) => {
    setSections((current) => ({
      ...current,
      [section]:
        !current[section],
    }))
  }


  const togglePriceVisibility = () => {
    setPriceVisibility((current) => ({
      ...current,
      loginRequired:
        !current.loginRequired,
    }))
  }


  const handleChange = (
    field,
    value,
  ) => {
    setHomepage((current) => ({
      ...current,
      [field]: value,
    }))
  }


  const toggleCategory = (
    categoryId,
  ) => {
    const normalizedId =
      String(categoryId)


    setSelectedCategoryIds(
      (current) => {
        if (
          current.includes(
            normalizedId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== normalizedId,
          )
        }


        return [
          ...current,
          normalizedId,
        ]
      },
    )
  }


  const toggleProduct = (
    productId,
  ) => {
    const normalizedId =
      String(productId)


    setSelectedProductIds(
      (current) => {
        if (
          current.includes(
            normalizedId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== normalizedId,
          )
        }


        return [
          ...current,
          normalizedId,
        ]
      },
    )
  }



  const uploadGalleryImages = async (files, replaceIndex = null) => {
    const selectedFiles = Array.from(files ?? [])
    if (!selectedFiles.length) return

    const availableSlots =
      replaceIndex === null
        ? 7 - gallery.images.length
        : 1

    if (selectedFiles.length > availableSlots) {
      setError(
        replaceIndex === null
          ? `You can add only ${Math.max(availableSlots, 0)} more image(s). Maximum is 7.`
          : 'Choose one image to replace the selected image.',
      )
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const invalidFile = selectedFiles.find(
      (file) => !allowedTypes.includes(file.type) || file.size > 7 * 1024 * 1024,
    )

    if (invalidFile) {
      setError('Only JPG, PNG, or WebP images up to 7 MB each are allowed.')
      return
    }

    const formData = new FormData()
    selectedFiles.forEach((file) => formData.append('images', file))

    try {
      setGalleryUploading(true)
      setError('')
      setSuccess('')

      const response = await apiRequest(
        '/website/homepage/gallery/upload',
        {
          method: 'POST',
          token,
          body: formData,
        },
      )

      const uploadedImages =
        response?.images ??
        response?.gallery?.images ??
        response?.files ??
        []

      if (!Array.isArray(uploadedImages) || uploadedImages.length !== selectedFiles.length) {
        throw new Error('The server did not return the uploaded gallery image details.')
      }

      setGallery((current) => {
        const nextImages = [...current.images]

        if (replaceIndex !== null) {
          nextImages[replaceIndex] = {
            ...uploadedImages[0],
            title: nextImages[replaceIndex]?.title ?? '',
            order: replaceIndex,
          }
        } else {
          uploadedImages.forEach((image) => {
            nextImages.push({
              ...image,
              title: image.title ?? '',
              order: nextImages.length,
            })
          })
        }

        return {
          ...current,
          images: nextImages.map((image, index) => ({
            ...image,
            order: index,
          })),
        }
      })

      setSuccess(
        replaceIndex === null
          ? 'Gallery image(s) uploaded. Click Save Changes to publish them.'
          : 'Gallery image replaced. Click Save Changes to publish the change.',
      )
    } catch (uploadError) {
      setError(uploadError?.message || 'Gallery image upload failed.')
    } finally {
      setGalleryUploading(false)
    }
  }

  const removeGalleryImage = (index) => {
    setGallery((current) => ({
      ...current,
      images: current.images
        .filter((_, imageIndex) => imageIndex !== index)
        .map((image, imageIndex) => ({
          ...image,
          order: imageIndex,
        })),
    }))
  }

  const moveGalleryImage = (index, direction) => {
    setGallery((current) => {
      const nextImages = [...current.images]
      const targetIndex = index + direction

      if (targetIndex < 0 || targetIndex >= nextImages.length) {
        return current
      }

      ;[nextImages[index], nextImages[targetIndex]] = [
        nextImages[targetIndex],
        nextImages[index],
      ]

      return {
        ...current,
        images: nextImages.map((image, imageIndex) => ({
          ...image,
          order: imageIndex,
        })),
      }
    })
  }

  const updateGalleryImageTitle = (index, title) => {
    setGallery((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, title } : image,
      ),
    }))
  }

  const handleSave = async () => {
    if (!token) {
      setError(
        'You are not authenticated.',
      )

      return
    }


    try {
      setSaving(true)
      setError('')
      setSuccess('')


      const data =
        await apiRequest(
          '/website/homepage',
          {
            method: 'PUT',

            token,

            body: {
              heading:
                homepage.heading,

              description:
                homepage.description,

              buttonText:
                homepage.buttonText,

              featuredCategoryIds:
                selectedCategoryIds,

              featuredProductIds:
                selectedProductIds,

              banner: {
                label:
                  banner.label,

                heading:
                  banner.heading,

                description:
                  banner.description,

                buttonText:
                  banner.buttonText,

                isActive:
                  banner.isActive,
              },

              sections,

              priceVisibility,

              gallery: {
                isActive: gallery.isActive,
                images: gallery.images.map((image, index) => ({
                  ...image,
                  order: index,
                })),
              },
            },
          },
        )


      if (!data?.homepage) {
        throw new Error(
          'Homepage changes could not be saved.',
        )
      }


      const savedHomepage =
        data.homepage


      setBanner({
        ...DEFAULT_BANNER,
        ...(savedHomepage.banner ?? {}),
      })


      setHomepage({
        heading:
          savedHomepage.heading ??
          DEFAULT_HOMEPAGE.heading,

        description:
          savedHomepage.description ??
          DEFAULT_HOMEPAGE.description,

        buttonText:
          savedHomepage.buttonText ??
          DEFAULT_HOMEPAGE.buttonText,
      })


      setSelectedCategoryIds(
        Array.isArray(
          savedHomepage.featuredCategoryIds,
        )
          ? savedHomepage.featuredCategoryIds.map(String)
          : [],
      )


      setSelectedProductIds(
        Array.isArray(
          savedHomepage.featuredProductIds,
        )
          ? savedHomepage.featuredProductIds.map(String)
          : [],
      )


      setSections({
        hero:
          savedHomepage.sections?.hero ??
          true,

        categories:
          savedHomepage.sections?.categories ??
          true,

        products:
          savedHomepage.sections?.products ??
          true,

        banner:
          savedHomepage.sections?.banner ??
          true,
      })


      setPriceVisibility({
        ...DEFAULT_PRICE_VISIBILITY,
        ...(savedHomepage.priceVisibility ?? {}),
      })

      


      setSuccess(
        'Homepage changes saved successfully.',
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Failed to save homepage changes.',
      )
    } finally {
      setSaving(false)
    }
  }


  return (

  <AdminLayout>
    <div className="homepage-management-page">

      {/* Header */}

      <div className="homepage-management-header">

        <div>

          <p className="homepage-management-breadcrumb">
            Admin / Website Management / Homepage
          </p>


          <h1>
            Homepage Management
          </h1>


          <p>
            Manage the content and sections displayed on your marketplace
            homepage.
          </p>

        </div>


        <button
          className="homepage-save-button"
          type="button"
          onClick={handleSave}
          disabled={
            loading ||
            saving
          }
        >
          {saving
            ? 'Saving...'
            : 'Save Changes'}
        </button>

      </div>


      {/* Status Messages */}

      {loading && (
        <p>
          Loading homepage content...
        </p>
      )}


      {error && (
        <p>
          {error}
        </p>
      )}


      {success && (
        <p>
          {success}
        </p>
      )}


      {/* Hero Section */}

      <section className="homepage-management-panel">

        <div className="homepage-panel-header">

          <div>

            <p className="homepage-panel-label">
              Main Section
            </p>


            <h2>
              Hero Section
            </h2>


            <p>
              Control the main message visitors see when they arrive on your
              marketplace.
            </p>

          </div>


          <button
            type="button"
            className={`homepage-toggle ${
              sections.hero
                ? 'active'
                : ''
            }`}
            onClick={() =>
              toggleSection('hero')
            }
          >
            <span />
          </button>

        </div>


        <div className="homepage-form-grid">

          <div className="homepage-form-group">

            <label>
              Heading
            </label>


            <input
              type="text"
              value={
                homepage.heading
              }
              onChange={(event) =>
                handleChange(
                  'heading',
                  event.target.value,
                )
              }
              placeholder="Enter homepage heading"
              disabled={loading}
            />

          </div>


          <div className="homepage-form-group">

            <label>
              Button Text
            </label>


            <input
              type="text"
              value={
                homepage.buttonText
              }
              onChange={(event) =>
                handleChange(
                  'buttonText',
                  event.target.value,
                )
              }
              placeholder="Enter button text"
              disabled={loading}
            />

          </div>


          <div className="homepage-form-group full-width">

            <label>
              Description
            </label>


            <textarea
              value={
                homepage.description
              }
              onChange={(event) =>
                handleChange(
                  'description',
                  event.target.value,
                )
              }
              placeholder="Enter homepage description"
              rows="4"
              disabled={loading}
            />

          </div>

        </div>

      </section>


      {/* Price Visibility */}

      <section className="homepage-management-panel">

        <div className="homepage-panel-header">

          <div>

            <p className="homepage-panel-label">
              Marketplace
            </p>


            <h2>
              Listing Price Visibility
            </h2>


            <p>
              Choose whether visitors must be logged in to see website
              listing prices.
            </p>

          </div>


          <button
            type="button"
            className={`homepage-toggle ${
              priceVisibility.loginRequired
                ? 'active'
                : ''
            }`}
            onClick={
              togglePriceVisibility
            }
            disabled={
              loading ||
              saving
            }
            aria-label={
              priceVisibility.loginRequired
                ? 'Require login to view listing prices'
                : 'Allow everyone to view listing prices'
            }
            aria-pressed={
              priceVisibility.loginRequired
            }
          >
            <span />
          </button>

        </div>


        <div className="homepage-price-visibility-status">

          <strong>
            {priceVisibility.loginRequired
              ? 'Login required to view prices'
              : 'Prices visible to everyone'}
          </strong>


          <p>
            {priceVisibility.loginRequired
              ? 'Guests and logged-out visitors will not see listing prices. Logged-in Buyers, Creators, and Admins can still see them.'
              : 'All visitors, including guests and logged-out users, can see listing prices.'}
          </p>

        </div>

      </section>



      {/* Scroll Gallery Management */}

      <section className="homepage-management-panel">
        <div className="homepage-panel-header">
          <div>
            <p className="homepage-panel-label">Homepage Experience</p>
            <h2>Scrolling Image Gallery</h2>
            <p>
              Manage up to 7 images displayed in the scroll-controlled gallery
              immediately before Browse Top Categories.
            </p>
          </div>

          <button
            type="button"
            className={`homepage-toggle ${gallery.isActive ? 'active' : ''}`}
            onClick={() =>
              setGallery((current) => ({
                ...current,
                isActive: !current.isActive,
              }))
            }
            disabled={loading || saving || galleryUploading}
            aria-label={gallery.isActive ? 'Disable gallery' : 'Enable gallery'}
            aria-pressed={gallery.isActive}
          >
            <span />
          </button>
        </div>

        <div className="homepage-price-visibility-status">
          <strong>
            {gallery.isActive ? 'Gallery enabled' : 'Gallery disabled'}
          </strong>
          <p>
            {gallery.isActive
              ? 'The gallery will appear on the public homepage after you save changes.'
              : 'The gallery is hidden from visitors. Your uploaded images will remain saved.'}
          </p>
        </div>

        <div className="homepage-form-group" style={{ marginTop: 20 }}>
          <label htmlFor="homepage-gallery-upload">
            Add gallery images ({gallery.images.length}/7)
          </label>
          <input
            id="homepage-gallery-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={
              loading ||
              saving ||
              galleryUploading ||
              gallery.images.length >= 7
            }
            onChange={(event) => {
              uploadGalleryImages(event.target.files)
              event.target.value = ''
            }}
          />
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>
            JPG, PNG or WebP · Maximum 7 MB per image · Maximum 7 images.
          </p>
        </div>

        {galleryUploading && (
          <p style={{ marginTop: 12 }}>Uploading gallery image(s)...</p>
        )}

        {gallery.images.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
              marginTop: 20,
            }}
          >
            {gallery.images.map((image, index) => (
              <div
                key={`${image.imageUrl}-${index}`}
                style={{
                  border: '1px solid var(--border-color, #ddd)',
                  borderRadius: 12,
                  padding: 12,
                  minWidth: 0,
                }}
              >
                <img
                  src={getGalleryImageUrl(image.imageUrl)}
                  alt={image.title || `Gallery image ${index + 1}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 145,
                    objectFit: 'cover',
                    borderRadius: 8,
                    background: '#eee',
                  }}
                />

                <p style={{ fontWeight: 600, margin: '10px 0' }}>
                  Image {index + 1}
                </p>

                <div className="homepage-form-group">
                  <label htmlFor={`gallery-title-${index}`}>Image title (optional)</label>
                  <input
                    id={`gallery-title-${index}`}
                    type="text"
                    maxLength={100}
                    value={image.title ?? ''}
                    onChange={(event) =>
                      updateGalleryImageTitle(index, event.target.value)
                    }
                    placeholder="Enter image title"
                    disabled={saving || galleryUploading}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => moveGalleryImage(index, -1)}
                    disabled={index === 0 || saving || galleryUploading}
                    aria-label={`Move image ${index + 1} left`}
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={() => moveGalleryImage(index, 1)}
                    disabled={index === gallery.images.length - 1 || saving || galleryUploading}
                    aria-label={`Move image ${index + 1} right`}
                  >
                    →
                  </button>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 10px',
                      border: '1px solid currentColor',
                      borderRadius: 6,
                      cursor: saving || galleryUploading ? 'not-allowed' : 'pointer',
                      opacity: saving || galleryUploading ? 0.5 : 1,
                    }}
                  >
                    Replace
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      disabled={saving || galleryUploading}
                      onChange={(event) => {
                        uploadGalleryImages(event.target.files, index)
                        event.target.value = ''
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    disabled={saving || galleryUploading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: 16 }}>
            No gallery images uploaded yet.
          </p>
        )}
      </section>

      {/* Featured Categories */}

      <section className="homepage-management-panel">

        <div className="homepage-panel-header">

          <div>

            <p className="homepage-panel-label">
              Marketplace
            </p>


            <h2>
              Featured Categories
            </h2>


            <p>
              Choose whether featured categories should appear on the homepage.
            </p>

          </div>


          <button
            type="button"
            className={`homepage-toggle ${
              sections.categories
                ? 'active'
                : ''
            }`}
            onClick={() =>
              toggleSection(
                'categories',
              )
            }
          >
            <span />
          </button>

        </div>


        <div className="homepage-category-selection">

          {categories.length === 0 ? (

            <p className="homepage-category-empty">
              No active categories available.
            </p>

          ) : (

            categories.map(
              (category) => {

                const categoryId =
                  String(
                    category._id,
                  )


                const selected =
                  selectedCategoryIds.includes(
                    categoryId,
                  )


                return (
                  <button
                    key={
                      categoryId
                    }
                    type="button"
                    className={`homepage-category-card ${
                      selected
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      toggleCategory(
                        categoryId,
                      )
                    }
                  >

                    <span className="homepage-category-check">
                      {selected
                        ? '✓'
                        : ''}
                    </span>


                    <div className="homepage-category-content">

                      <strong>
                        {category.name}
                      </strong>


                      <p>
                        {
                          category.description
                        }
                      </p>

                    </div>

                  </button>
                )
              },
            )

          )}

        </div>

      </section>


      {/* Featured Products */}

      <section className="homepage-management-panel">

        <div className="homepage-panel-header">

          <div>

            <p className="homepage-panel-label">
              Marketplace
            </p>


            <h2>
              Featured Products
            </h2>


            <p>
              Choose which approved websites should appear as featured products on the homepage.
            </p>

          </div>


          <button
            type="button"
            className={`homepage-toggle ${
              sections.products
                ? 'active'
                : ''
            }`}
            onClick={() =>
              toggleSection(
                'products',
              )
            }
          >
            <span />
          </button>

        </div>


        <div className="homepage-product-selection">

          {products.length === 0 ? (

            <p className="homepage-category-empty">
              No approved products are available.
            </p>

          ) : (

            products.map(
              (product) => {

                const productId =
                  String(
                    product._id,
                  )


                const selected =
                  selectedProductIds.includes(
                    productId,
                  )


                return (
                  <button
                    key={
                      productId
                    }
                    type="button"
                    className={`homepage-product-card ${
                      selected
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      toggleProduct(
                        productId,
                      )
                    }
                  >

                    <span className="homepage-product-check">
                      {selected
                        ? '✓'
                        : ''}
                    </span>


                    <div className="homepage-product-content">

                      <strong>
                        {
                          product.name
                        }
                      </strong>


                      <p>
                        {
                          product.description ||
                          'Marketplace website'
                        }
                      </p>


                      <span className="homepage-product-price">
                        ₹
                        {Number(
                          product.price ?? 0,
                        ).toLocaleString(
                          'en-IN',
                        )}
                      </span>

                    </div>

                  </button>
                )
              },
            )
          )}

        </div>

      </section>

    </div>
  </AdminLayout>
  )
}

export default HomepagePage