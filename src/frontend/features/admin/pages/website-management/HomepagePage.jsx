import { useEffect, useState } from 'react'

import { useAuth } from '../../../auth/useAuth.js'
import { apiRequest } from '../../../../../services/apiClient.js'

import './HomepagePage.css'


const DEFAULT_HOMEPAGE = {
  heading:
    'Find the perfect website for your business',

  description:
    'Discover premium websites, templates, and digital products from trusted sellers.',

  buttonText:
    'Explore Websites',
}


const DEFAULT_SECTIONS = {
  hero: true,
  categories: true,
  products: true,
  banner: true,
}


function HomepagePage() {
  const { token } = useAuth()


  const [homepage, setHomepage] =
    useState(DEFAULT_HOMEPAGE)


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

              sections,
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
  )
}


export default HomepagePage