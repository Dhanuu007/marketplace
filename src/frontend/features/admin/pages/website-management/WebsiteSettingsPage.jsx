import { useEffect, useState } from 'react'

import { useAuth } from '../../../auth/useAuth.js'
import { apiRequest } from '../../../../../services/apiClient.js'

import './WebsiteSettingsPage.css'


const DEFAULT_SETTINGS = {
  marketplaceName: 'Marketplace',

  marketplaceDescription:
    'Discover premium websites from trusted creators.',

  supportEmail: '',

  currency: 'INR',

  commissionPercentage: 5,

  marketplaceActive: true,

  contactEmail: '',

  phone: '',

  socialLinks: {
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: '',
  },

  seo: {
    metaTitle: 'Marketplace',
    metaDescription:
      'Discover premium websites from trusted creators.',
  },
}


function WebsiteSettingsPage() {
  const { token } = useAuth()


  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS)


  const [loading, setLoading] =
    useState(true)


  const [saving, setSaving] =
    useState(false)


  const [error, setError] =
    useState('')


  const [success, setSuccess] =
    useState('')


  useEffect(() => {
    async function loadSettings() {
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
            '/website/settings',
            {
              token,
            },
          )


        if (data?.settings) {
          const savedSettings =
            data.settings


          setSettings({
            marketplaceName:
              savedSettings.marketplaceName ??
              DEFAULT_SETTINGS.marketplaceName,

            marketplaceDescription:
              savedSettings.marketplaceDescription ??
              DEFAULT_SETTINGS.marketplaceDescription,

            supportEmail:
              savedSettings.supportEmail ??
              DEFAULT_SETTINGS.supportEmail,

            currency:
              savedSettings.currency ??
              DEFAULT_SETTINGS.currency,

            commissionPercentage:
              savedSettings.commissionPercentage ??
              DEFAULT_SETTINGS.commissionPercentage,

            marketplaceActive:
              savedSettings.marketplaceActive ??
              DEFAULT_SETTINGS.marketplaceActive,

            contactEmail:
              savedSettings.contactEmail ??
              DEFAULT_SETTINGS.contactEmail,

            phone:
              savedSettings.phone ??
              DEFAULT_SETTINGS.phone,

            socialLinks: {
              instagram:
                savedSettings.socialLinks?.instagram ??
                '',

              facebook:
                savedSettings.socialLinks?.facebook ??
                '',

              linkedin:
                savedSettings.socialLinks?.linkedin ??
                '',

              twitter:
                savedSettings.socialLinks?.twitter ??
                '',
            },

            seo: {
              metaTitle:
                savedSettings.seo?.metaTitle ??
                DEFAULT_SETTINGS.seo.metaTitle,

              metaDescription:
                savedSettings.seo?.metaDescription ??
                DEFAULT_SETTINGS.seo.metaDescription,
            },
          })
        }
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Failed to load website settings.',
        )
      } finally {
        setLoading(false)
      }
    }


    loadSettings()
  }, [token])


  const handleChange = (
    field,
    value,
  ) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }))
  }


  const handleSocialChange = (
    field,
    value,
  ) => {
    setSettings((current) => ({
      ...current,

      socialLinks: {
        ...current.socialLinks,
        [field]: value,
      },
    }))
  }


  const handleSeoChange = (
    field,
    value,
  ) => {
    setSettings((current) => ({
      ...current,

      seo: {
        ...current.seo,
        [field]: value,
      },
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
          '/website/settings',
          {
            method: 'PUT',

            token,

            body: {
              ...settings,

              commissionPercentage:
                Number(
                  settings.commissionPercentage,
                ),
            },
          },
        )


      if (!data?.settings) {
        throw new Error(
          'Website settings could not be saved.',
        )
      }


      const savedSettings =
        data.settings


      setSettings({
        marketplaceName:
          savedSettings.marketplaceName ??
          DEFAULT_SETTINGS.marketplaceName,

        marketplaceDescription:
          savedSettings.marketplaceDescription ??
          DEFAULT_SETTINGS.marketplaceDescription,

        supportEmail:
          savedSettings.supportEmail ??
          DEFAULT_SETTINGS.supportEmail,

        currency:
          savedSettings.currency ??
          DEFAULT_SETTINGS.currency,

        commissionPercentage:
          savedSettings.commissionPercentage ??
          DEFAULT_SETTINGS.commissionPercentage,

        marketplaceActive:
          savedSettings.marketplaceActive ??
          DEFAULT_SETTINGS.marketplaceActive,

        contactEmail:
          savedSettings.contactEmail ??
          DEFAULT_SETTINGS.contactEmail,

        phone:
          savedSettings.phone ??
          DEFAULT_SETTINGS.phone,

        socialLinks: {
          instagram:
            savedSettings.socialLinks?.instagram ??
            '',

          facebook:
            savedSettings.socialLinks?.facebook ??
            '',

          linkedin:
            savedSettings.socialLinks?.linkedin ??
            '',

          twitter:
            savedSettings.socialLinks?.twitter ??
            '',
        },

        seo: {
          metaTitle:
            savedSettings.seo?.metaTitle ??
            DEFAULT_SETTINGS.seo.metaTitle,

          metaDescription:
            savedSettings.seo?.metaDescription ??
            DEFAULT_SETTINGS.seo.metaDescription,
        },
      })


      setSuccess(
        'Website settings saved successfully.',
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Failed to save website settings.',
      )
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="website-settings-page">

      <div className="website-settings-header">

        <div>

          <p className="website-settings-breadcrumb">
            Admin / Website Management / Settings
          </p>

          <h1>
            Website Settings
          </h1>

          <p>
            Manage the general settings and configuration of your marketplace.
          </p>

        </div>


        <button
          className="website-settings-save-button"
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


      {loading && (
        <p>
          Loading website settings...
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


      {/* General */}

      <section className="website-settings-panel">

        <div className="website-settings-panel-header">

          <div>

            <p className="website-settings-panel-label">
              General
            </p>

            <h2>
              Marketplace Information
            </h2>

            <p>
              Manage the basic identity and description of your marketplace.
            </p>

          </div>

        </div>


        <div className="website-settings-form-grid">

          <div className="website-settings-form-group">

            <label>
              Marketplace Name
            </label>

            <input
              type="text"
              value={
                settings.marketplaceName
              }
              onChange={(event) =>
                handleChange(
                  'marketplaceName',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>


          <div className="website-settings-form-group">

            <label>
              Support Email
            </label>

            <input
              type="email"
              value={
                settings.supportEmail
              }
              onChange={(event) =>
                handleChange(
                  'supportEmail',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>


          <div className="website-settings-form-group full-width">

            <label>
              Marketplace Description
            </label>

            <textarea
              rows="4"
              value={
                settings.marketplaceDescription
              }
              onChange={(event) =>
                handleChange(
                  'marketplaceDescription',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>

        </div>

      </section>


      {/* Marketplace */}

      <section className="website-settings-panel">

        <div className="website-settings-panel-header">

          <div>

            <p className="website-settings-panel-label">
              Marketplace
            </p>

            <h2>
              Marketplace Configuration
            </h2>

            <p>
              Configure currency, commission, and marketplace availability.
            </p>

          </div>


          <button
            type="button"
            className={`website-settings-toggle ${
              settings.marketplaceActive
                ? 'active'
                : ''
            }`}
            onClick={() =>
              handleChange(
                'marketplaceActive',
                !settings.marketplaceActive,
              )
            }
          >
            <span />
          </button>

        </div>


        <div className="website-settings-form-grid">

          <div className="website-settings-form-group">

            <label>
              Currency
            </label>

            <select
              value={
                settings.currency
              }
              onChange={(event) =>
                handleChange(
                  'currency',
                  event.target.value,
                )
              }
              disabled={loading}
            >
              <option value="INR">
                INR - Indian Rupee
              </option>

              <option value="USD">
                USD - US Dollar
              </option>

              <option value="EUR">
                EUR - Euro
              </option>
            </select>

          </div>


          <div className="website-settings-form-group">

            <label>
              Marketplace Commission (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={
                settings.commissionPercentage
              }
              onChange={(event) =>
                handleChange(
                  'commissionPercentage',
                  event.target.value,
                )
              }
              disabled={loading}
            />

            <small>
              Current business rule: Marketplace keeps 5% and creators receive 95%.
            </small>

          </div>

        </div>

      </section>


      {/* Contact */}

      <section className="website-settings-panel">

        <div className="website-settings-panel-header">

          <div>

            <p className="website-settings-panel-label">
              Contact
            </p>

            <h2>
              Contact Information
            </h2>

            <p>
              Manage the contact details displayed or used by the marketplace.
            </p>

          </div>

        </div>


        <div className="website-settings-form-grid">

          <div className="website-settings-form-group">

            <label>
              Contact Email
            </label>

            <input
              type="email"
              value={
                settings.contactEmail
              }
              onChange={(event) =>
                handleChange(
                  'contactEmail',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>


          <div className="website-settings-form-group">

            <label>
              Phone
            </label>

            <input
              type="text"
              value={
                settings.phone
              }
              onChange={(event) =>
                handleChange(
                  'phone',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>

        </div>

      </section>


      {/* Social Links */}

      <section className="website-settings-panel">

        <div className="website-settings-panel-header">

          <div>

            <p className="website-settings-panel-label">
              Social
            </p>

            <h2>
              Social Links
            </h2>

            <p>
              Add your marketplace social media links.
            </p>

          </div>

        </div>


        <div className="website-settings-form-grid">

          <div className="website-settings-form-group">

            <label>
              Instagram
            </label>

            <input
              type="url"
              value={
                settings.socialLinks.instagram
              }
              onChange={(event) =>
                handleSocialChange(
                  'instagram',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>


          <div className="website-settings-form-group">

            <label>
              Facebook
            </label>

            <input
              type="url"
              value={
                settings.socialLinks.facebook
              }
              onChange={(event) =>
                handleSocialChange(
                  'facebook',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>


          <div className="website-settings-form-group">

            <label>
              LinkedIn
            </label>

            <input
              type="url"
              value={
                settings.socialLinks.linkedin
              }
              onChange={(event) =>
                handleSocialChange(
                  'linkedin',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>


          <div className="website-settings-form-group">

            <label>
              X / Twitter
            </label>

            <input
              type="url"
              value={
                settings.socialLinks.twitter
              }
              onChange={(event) =>
                handleSocialChange(
                  'twitter',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>

        </div>

      </section>


      {/* SEO */}

      <section className="website-settings-panel">

        <div className="website-settings-panel-header">

          <div>

            <p className="website-settings-panel-label">
              SEO
            </p>

            <h2>
              Search Engine Settings
            </h2>

            <p>
              Configure the basic metadata used by search engines.
            </p>

          </div>

        </div>


        <div className="website-settings-form-grid">

          <div className="website-settings-form-group full-width">

            <label>
              Meta Title
            </label>

            <input
              type="text"
              value={
                settings.seo.metaTitle
              }
              onChange={(event) =>
                handleSeoChange(
                  'metaTitle',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>


          <div className="website-settings-form-group full-width">

            <label>
              Meta Description
            </label>

            <textarea
              rows="4"
              value={
                settings.seo.metaDescription
              }
              onChange={(event) =>
                handleSeoChange(
                  'metaDescription',
                  event.target.value,
                )
              }
              disabled={loading}
            />

          </div>

        </div>

      </section>

    </div>
  )
}


export default WebsiteSettingsPage