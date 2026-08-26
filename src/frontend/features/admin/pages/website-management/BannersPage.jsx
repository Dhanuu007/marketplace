import { useEffect, useState } from 'react'

import { useAuth } from '../../../auth/useAuth.js'
import { apiRequest } from '../../../../../services/apiClient.js'

import './BannersPage.css'


const DEFAULT_BANNER = {
  label: 'PROMOTION',

  heading:
    'Build your online presence today.',

  description:
    'Discover premium websites from our marketplace.',

  buttonText: 'Explore Now',

  isActive: true,
}


function BannersPage() {
  const { token } = useAuth()


  const [banner, setBanner] =
    useState(DEFAULT_BANNER)


  const [homepage, setHomepage] =
    useState({
      heading: '',

      description: '',

      buttonText: '',

      featuredCategoryIds: [],

      featuredProductIds: [],

      sections: {
        hero: true,

        categories: true,

        products: true,

        banner: true,
      },
    })


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


        const data =
          await apiRequest(
            '/website/homepage',
            {
              token,
            },
          )


        if (data?.homepage) {
          setHomepage({
            heading:
              data.homepage.heading ?? '',

            description:
              data.homepage.description ?? '',

            buttonText:
              data.homepage.buttonText ?? '',

            featuredCategoryIds:
              data.homepage.featuredCategoryIds ?? [],

            featuredProductIds:
              data.homepage.featuredProductIds ?? [],

            sections: {
              hero:
                data.homepage.sections?.hero ??
                true,

              categories:
                data.homepage.sections?.categories ??
                true,

              products:
                data.homepage.sections?.products ??
                true,

              banner:
                data.homepage.sections?.banner ??
                true,
            },
          })


          setBanner({
            ...DEFAULT_BANNER,

            ...(data.homepage.banner ?? {}),
          })
        }
      } catch (requestError) {
        setError(
          requestError.message ||
            'Failed to load banner content.',
        )
      } finally {
        setLoading(false)
      }
    }


    loadHomepage()
  }, [token])


  const handleBannerChange = (
    field,
    value,
  ) => {
    setBanner((current) => ({
      ...current,

      [field]: value,
    }))
  }


  const toggleBanner = () => {
    setBanner((current) => ({
      ...current,

      isActive:
        !current.isActive,
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
                homepage.featuredCategoryIds,

              featuredProductIds:
                homepage.featuredProductIds,

              sections:
                homepage.sections,

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
            },
          },
        )


      if (data?.homepage) {
        setHomepage({
          heading:
            data.homepage.heading ?? '',

          description:
            data.homepage.description ?? '',

          buttonText:
            data.homepage.buttonText ?? '',

          featuredCategoryIds:
            data.homepage.featuredCategoryIds ?? [],

          featuredProductIds:
            data.homepage.featuredProductIds ?? [],

          sections: {
            hero:
              data.homepage.sections?.hero ??
              true,

            categories:
              data.homepage.sections?.categories ??
              true,

            products:
              data.homepage.sections?.products ??
              true,

            banner:
              data.homepage.sections?.banner ??
              true,
          },
        })


        setBanner({
          ...DEFAULT_BANNER,

          ...(data.homepage.banner ?? {}),
        })
      }


      setSuccess(
        'Promotional banner saved successfully.',
      )
    } catch (requestError) {
      setError(
        requestError.message ||
          'Failed to save promotional banner.',
      )
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="banners-management-page">

      {/* Header */}

      <div className="banners-management-header">

        <div>

          <p className="banners-management-breadcrumb">
            Admin / Website Management / Banners
          </p>


          <h1>
            Banners
          </h1>


          <p>
            Manage the promotional banner displayed on your
            marketplace homepage.
          </p>

        </div>


        <button
          className="banners-save-button"
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


      {/* Status */}

      {loading && (
        <p className="banners-status">
          Loading banner content...
        </p>
      )}


      {error && (
        <p className="banners-status error">
          {error}
        </p>
      )}


      {success && (
        <p className="banners-status success">
          {success}
        </p>
      )}


      {/* Banner Settings */}

      <section className="banners-management-panel">

        <div className="banners-panel-header">

          <div>

            <p className="banners-panel-label">
              Promotion
            </p>


            <h2>
              Promotional Banner
            </h2>


            <p>
              Control the content visitors see in the
              promotional banner.
            </p>

          </div>


          <button
            type="button"
            className={`banners-toggle ${
              banner.isActive
                ? 'active'
                : ''
            }`}
            onClick={toggleBanner}
            aria-label={
              banner.isActive
                ? 'Disable banner'
                : 'Enable banner'
            }
          >
            <span />
          </button>

        </div>


        <div className="banners-form-grid">

          {/* Label */}

          <div className="banners-form-group">

            <label>
              Banner Label
            </label>


            <input
              type="text"
              value={
                banner.label
              }
              onChange={(event) =>
                handleBannerChange(
                  'label',
                  event.target.value,
                )
              }
              placeholder="PROMOTION"
              disabled={loading}
            />

          </div>


          {/* Button */}

          <div className="banners-form-group">

            <label>
              Button Text
            </label>


            <input
              type="text"
              value={
                banner.buttonText
              }
              onChange={(event) =>
                handleBannerChange(
                  'buttonText',
                  event.target.value,
                )
              }
              placeholder="Explore Now"
              disabled={loading}
            />

          </div>


          {/* Heading */}

          <div className="banners-form-group full-width">

            <label>
              Heading
            </label>


            <input
              type="text"
              value={
                banner.heading
              }
              onChange={(event) =>
                handleBannerChange(
                  'heading',
                  event.target.value,
                )
              }
              placeholder="Enter banner heading"
              disabled={loading}
            />

          </div>


          {/* Description */}

          <div className="banners-form-group full-width">

            <label>
              Description
            </label>


            <textarea
              value={
                banner.description
              }
              onChange={(event) =>
                handleBannerChange(
                  'description',
                  event.target.value,
                )
              }
              placeholder="Enter banner description"
              rows="4"
              disabled={loading}
            />

          </div>

        </div>

      </section>


      {/* Preview */}

      <section className="banners-management-panel">

        <div className="banners-panel-header">

          <div>

            <p className="banners-panel-label">
              Preview
            </p>


            <h2>
              Homepage Banner
            </h2>


            <p>
              This is how the promotional banner will
              appear on the homepage.
            </p>

          </div>

        </div>


        <div
          className={`banners-preview ${
            !banner.isActive
              ? 'inactive'
              : ''
          }`}
        >

          <div className="banners-preview-content">

            <span className="banners-preview-label">
              {
                banner.label ||
                'PROMOTION'
              }
            </span>


            <h3>
              {
                banner.heading ||
                'Build your online presence today.'
              }
            </h3>


            <p>
              {
                banner.description ||
                'Discover premium websites from our marketplace.'
              }
            </p>

          </div>


          <button
            type="button"
            className="banners-preview-button"
          >
            {
              banner.buttonText ||
              'Explore Now'
            }
          </button>

        </div>

      </section>

    </div>
  )
}


export default BannersPage