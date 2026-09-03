import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import MarketplaceIntro from "../admin/components/MarketplaceIntro.jsx"
import CookieConsent from "../admin/components/CookieConsent.jsx"

import { AccountPage } from '../auth/AccountPage.jsx'
import { ForgotPasswordPage } from '../auth/ForgotPasswordPage.jsx'
import { ResetPasswordPage } from '../auth/ResetPasswordPage.jsx'
import { LoginPage } from '../auth/LoginPage.jsx'
import { ProtectedRoute } from '../auth/ProtectedRoute.jsx'
import { RegisterPage } from '../auth/RegisterPage.jsx'

import { FoundationPage } from '../foundation/FoundationPage.jsx'

import { CategoryPage } from '../marketplace/componentes/CategoryPage.jsx'
import { ProductsPage } from '../marketplace/componentes/ProductsPage.jsx'
import { ProductDetailsPage } from '../marketplace/componentes/ProductDetailsPage.jsx'
import { CartPage } from '../marketplace/componentes/CartPage.jsx'
import { CheckoutPage } from '../marketplace/componentes/CheckoutPage.jsx'

import { CreatorDashboardPage } from '../creator/CreatorDashboardPage.jsx'
import { CreatorListingPage } from '../creator/CreatorListingPage.jsx'
import { CreatorEditListingPage } from '../creator/CreatorEditListingPage.jsx'
import { CreatorOrdersPage } from '../creator/CreatorOrdersPage.jsx'
import { CreatorPaymentSettingsPage } from '../creator/CreatorPaymentSettingsPage.jsx'
import { CreatorFinancesPage } from '../creator/CreatorFinancesPage.jsx'
import { CreatorAutomatedPayoutsPage } from '../creator/CreatorAutomatedPayoutsPage.jsx'
import { CreatorChatPage } from '../creator/CreatorChatPage.jsx'
import { CreatorConversationPage } from '../creator/CreatorConversationPage.jsx'

import { BuyerDashboardPage } from '../buyer/BuyerDashboardPage.jsx'
import { BuyerOrdersPage } from '../buyer/BuyerOrdersPage.jsx'
import { BuyerChatPage } from '../buyer/BuyerChatPage.jsx'
import { BuyerSuspensionSupportPage } from '../buyer/BuyerSuspensionSupportPage.jsx'

import { AdminDashboardPage } from '../admin/AdminDashboardPage.jsx'
import { AdminOrdersPage } from '../admin/AdminOrdersPage.jsx'
import { AdminProductsPage } from '../admin/AdminProductsPage.jsx'
import { AdminPayoutsPage } from '../admin/AdminPayoutsPage.jsx'
import { AdminActivityPage } from '../admin/AdminActivityPage.jsx'
import { AdminChatPage } from '../admin/AdminChatPage.jsx'
import { AdminConversationPage } from '../admin/AdminConversationPage.jsx'
import { AccountSecurityPage } from '../admin/AccountSecurityPage.jsx'

import WebsiteManagementPage from '../admin/pages/WebsiteManagementPage.jsx'
import HomepagePage from '../admin/pages/website-management/HomepagePage.jsx'
import HeroSectionPage from '../admin/pages/website-management/HeroSectionPage.jsx'
import CategoriesPage from '../admin/pages/website-management/CategoriesPage.jsx'
import FeaturedProductsPage from '../admin/pages/website-management/FeaturedProductsPage.jsx'
import BannersPage from '../admin/pages/website-management/BannersPage.jsx'
import WebsiteSettingsPage from '../admin/pages/website-management/WebsiteSettingsPage.jsx'


export function AppRoutes() {

  const [showIntro, setShowIntro] = useState(true)

  return (
    <>
      <Routes>

        {/* =========================
            PUBLIC MARKETPLACE
        ========================= */}

        <Route
          path="/creator/automated-payouts"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorAutomatedPayoutsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            showIntro ? (
              <MarketplaceIntro
                onComplete={() => setShowIntro(false)}
              />
            ) : (
              <FoundationPage />
            )
          }
        />

        <Route
          path="/products"
          element={<ProductsPage />}
        />

        <Route
          path="/product/:productId"
          element={<ProductDetailsPage />}
        />

        <Route
          path="/category/:slug"
          element={<CategoryPage />}
        />

        <Route
          path="/cart"
          element={<CartPage />}
        />

        <Route
          path="/checkout"
          element={<CheckoutPage />}
        />


        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />


        {/* =========================
            WEBSITE CREATOR
        ========================= */}

        <Route
          path="/creator/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/creator/chat"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/creator/chat/:conversationId"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorConversationPage />
            </ProtectedRoute>
          }
        />


        {/* =========================
              WEBSITE BUYER
        ========================= */}

        <Route
          path="/buyer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyer/suspension-support"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerSuspensionSupportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyer/orders"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
            path="/buyer/chat"
            element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <BuyerChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/chat/:conversationId"
            element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <BuyerChatPage />
              </ProtectedRoute>
            }
          />

        <Route
          path="/creator/orders"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/creator/payment-settings"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorPaymentSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/creator/finances"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorFinancesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/creator/listings/new"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorListingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/creator/listings/:productId/edit"
          element={
            <ProtectedRoute allowedRoles={['CREATOR']}>
              <CreatorEditListingPage />
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminActivityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payouts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPayoutsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/account-security"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AccountSecurityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/website-management"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <WebsiteManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/website-management/homepage"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <HomepagePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/website-management/hero"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <HeroSectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/website-management/categories"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/website-management/featured-products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FeaturedProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/website-management/banners"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <BannersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/website-management/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <WebsiteSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/chat"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/chat/:conversationId"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminConversationPage />
            </ProtectedRoute>
          }
        />


        {/* =========================
            FALLBACK
        ========================= */}

        <Route
          path="*"
          element={<Navigate replace to="/" />}
        />

      </Routes>

      {/* =========================
          COOKIE CONSENT
      ========================= */}

      {!showIntro && <CookieConsent />}

    </>
  )
}