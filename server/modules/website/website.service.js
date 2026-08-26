import {
  getHomepage,
  saveHomepage,
  getWebsiteSettings,
  saveWebsiteSettings,
} from './website.repository.js'

import { getCategories } from '../category/category.repository.js'
import { getProducts } from '../product/product.repository.js'


export async function getHomepageContent() {
  const homepage = await getHomepage()

  if (!homepage) {
    return {
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
    }
  }

  return {
    heading: homepage.heading,
    description: homepage.description,
    buttonText: homepage.buttonText,

    featuredCategoryIds:
      homepage.featuredCategoryIds ?? [],

    featuredProductIds:
      homepage.featuredProductIds ?? [],

    banner: {
      label: homepage.banner?.label ?? 'PROMOTION',

      heading:
        homepage.banner?.heading ??
        'Build your online presence today.',

      description:
        homepage.banner?.description ??
        'Discover premium websites from our marketplace.',

      buttonText:
        homepage.banner?.buttonText ?? 'Explore Now',

      isActive:
        homepage.banner?.isActive ?? true,
    },

    sections: {
      hero: homepage.sections?.hero ?? true,

      categories:
        homepage.sections?.categories ?? true,

      products:
        homepage.sections?.products ?? true,

      banner:
        homepage.sections?.banner ?? true,
    },

    updatedAt: homepage.updatedAt,
  }
}


export async function getPublicHomepageContent() {
  const homepage = await getHomepage()

  const categories = await getCategories()
  const products = await getProducts()

  const homepageContent = homepage
    ? {
        heading: homepage.heading,
        description: homepage.description,
        buttonText: homepage.buttonText,

        featuredCategoryIds:
          homepage.featuredCategoryIds ?? [],

        featuredProductIds:
          homepage.featuredProductIds ?? [],

        banner: {
          label:
            homepage.banner?.label ?? 'PROMOTION',

          heading:
            homepage.banner?.heading ??
            'Build your online presence today.',

          description:
            homepage.banner?.description ??
            'Discover premium websites from our marketplace.',

          buttonText:
            homepage.banner?.buttonText ?? 'Explore Now',

          isActive:
            homepage.banner?.isActive ?? true,
        },

        sections: {
          hero:
            homepage.sections?.hero ?? true,

          categories:
            homepage.sections?.categories ?? true,

          products:
            homepage.sections?.products ?? true,

          banner:
            homepage.sections?.banner ?? true,
        },
      }
    : {
        heading:
          'Find the perfect website for your business',

        description:
          'Discover premium websites, templates, and digital products from trusted sellers.',

        buttonText:
          'Explore Websites',

        featuredCategoryIds: [],
        featuredProductIds: [],

        banner: {
          label: 'PROMOTION',

          heading:
            'Build your online presence today.',

          description:
            'Discover premium websites from our marketplace.',

          buttonText:
            'Explore Now',

          isActive: true,
        },

        sections: {
          hero: true,
          categories: true,
          products: true,
          banner: true,
        },
      }

  const featuredCategoryIds =
    homepageContent.featuredCategoryIds.map(String)

  const featuredProductIds =
    homepageContent.featuredProductIds.map(String)

  const featuredCategories = categories.filter((category) =>
    featuredCategoryIds.includes(String(category._id)),
  )

  const featuredProducts = products.filter((product) =>
    featuredProductIds.includes(String(product._id)),
  )

  return {
    ...homepageContent,

    categories: featuredCategories,

    products: featuredProducts,
  }
}


export async function updateHomepageContent(input) {
  const homepage = await saveHomepage(input)

  return {
    heading: homepage.heading,
    description: homepage.description,

    buttonText: homepage.buttonText,

    featuredCategoryIds:
      homepage.featuredCategoryIds ?? [],

    featuredProductIds:
      homepage.featuredProductIds ?? [],

    banner: {
      label:
        homepage.banner?.label ?? 'PROMOTION',

      heading:
        homepage.banner?.heading ??
        'Build your online presence today.',

      description:
        homepage.banner?.description ??
        'Discover premium websites from our marketplace.',

      buttonText:
        homepage.banner?.buttonText ?? 'Explore Now',

      isActive:
        homepage.banner?.isActive ?? true,
    },

    sections: {
      hero:
        homepage.sections?.hero ?? true,

      categories:
        homepage.sections?.categories ?? true,

      products:
        homepage.sections?.products ?? true,

      banner:
        homepage.sections?.banner ?? true,
    },

    updatedAt: homepage.updatedAt,
  }
}

// =========================
// WEBSITE SETTINGS
// =========================

export async function getWebsiteSettingsContent() {
  const settings = await getWebsiteSettings()

  if (!settings) {
    return {
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
  }

  return {
    marketplaceName:
      settings.marketplaceName ?? 'Marketplace',

    marketplaceDescription:
      settings.marketplaceDescription ??
      'Discover premium websites from trusted creators.',

    supportEmail:
      settings.supportEmail ?? '',

    currency:
      settings.currency ?? 'INR',

    commissionPercentage:
      settings.commissionPercentage ?? 5,

    marketplaceActive:
      settings.marketplaceActive ?? true,

    contactEmail:
      settings.contactEmail ?? '',

    phone:
      settings.phone ?? '',

    socialLinks: {
      instagram:
        settings.socialLinks?.instagram ?? '',

      facebook:
        settings.socialLinks?.facebook ?? '',

      linkedin:
        settings.socialLinks?.linkedin ?? '',

      twitter:
        settings.socialLinks?.twitter ?? '',
    },

    seo: {
      metaTitle:
        settings.seo?.metaTitle ??
        'Marketplace',

      metaDescription:
        settings.seo?.metaDescription ??
        'Discover premium websites from trusted creators.',
    },

    updatedAt: settings.updatedAt,
  }
}


export async function updateWebsiteSettingsContent(
  input,
) {
  const settings =
    await saveWebsiteSettings(input)

  return {
    marketplaceName:
      settings.marketplaceName,

    marketplaceDescription:
      settings.marketplaceDescription,

    supportEmail:
      settings.supportEmail,

    currency:
      settings.currency,

    commissionPercentage:
      settings.commissionPercentage,

    marketplaceActive:
      settings.marketplaceActive,

    contactEmail:
      settings.contactEmail,

    phone:
      settings.phone,

    socialLinks: {
      instagram:
        settings.socialLinks?.instagram ?? '',

      facebook:
        settings.socialLinks?.facebook ?? '',

      linkedin:
        settings.socialLinks?.linkedin ?? '',

      twitter:
        settings.socialLinks?.twitter ?? '',
    },

    seo: {
      metaTitle:
        settings.seo?.metaTitle ?? '',

      metaDescription:
        settings.seo?.metaDescription ?? '',
    },

    updatedAt:
      settings.updatedAt,
  }
}