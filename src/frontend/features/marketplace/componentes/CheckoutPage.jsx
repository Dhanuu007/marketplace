import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../auth/useAuth.js'
import { apiRequest } from '../../../../services/apiClient.js'

import {
  getCart,
  clearCart,
} from '../cart/cartService.js'

import './CheckoutPage.css'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { token, isAuthenticated } = useAuth()

  const [cart] = useState(getCart)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [errors, setErrors] = useState({})

  /*
   * Successful Marketplace order.
   *
   * This is only populated after Razorpay payment
   * has been successfully verified.
   */
  const [order, setOrder] = useState(null)

  /*
   * Pending Marketplace order.
   *
   * Once the first Marketplace order is created,
   * we keep it here so a cancelled/failed payment
   * can be retried against the SAME Marketplace order.
   *
   * This prevents duplicate PENDING Marketplace
   * orders from being created on every retry.
   */
  const [pendingOrder, setPendingOrder] = useState(null)

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  )

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  )

  useEffect(() => {
    if (
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      )
    ) {
      return
    }

    const script =
      document.createElement('script')

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js'

    script.async = true

    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(
          script,
        )
      }
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))

    if (orderError) {
      setOrderError('')
    }
  }

  function validateForm() {
    const validationErrors = {}

    const fullName = formData.fullName.trim()
    const email = formData.email.trim()
    const phone = formData.phone.trim()
    const address = formData.address.trim()
    const city = formData.city.trim()
    const state = formData.state.trim()
    const pincode = formData.pincode.trim()

    if (!fullName) {
      validationErrors.fullName =
        'Full name is required.'
    } else if (fullName.length < 2) {
      validationErrors.fullName =
        'Full name must be at least 2 characters.'
    } else if (
      fullName.length > 80
    ) {
      validationErrors.fullName =
        'Full name must be 80 characters or less.'
    } else if (
      !/^[A-Za-zÀ-ÿ\s.'-]+$/.test(fullName)
    ) {
      validationErrors.fullName =
        'Please enter a valid full name.'
    }

    if (!email) {
      validationErrors.email =
        'Email address is required.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      validationErrors.email =
        'Please enter a valid email address.'
    }

    if (!phone) {
      validationErrors.phone =
        'Phone number is required.'
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      validationErrors.phone =
        'Enter a valid 10-digit Indian mobile number.'
    }

    if (!address) {
      validationErrors.address =
        'Address is required.'
    } else if (address.length < 10) {
      validationErrors.address =
        'Please enter a complete address.'
    } else if (address.length > 250) {
      validationErrors.address =
        'Address must be 250 characters or less.'
    }

    if (!city) {
      validationErrors.city =
        'City is required.'
    } else if (
      city.length < 2 ||
      city.length > 50
    ) {
      validationErrors.city =
        'Please enter a valid city.'
    }

    if (!state) {
      validationErrors.state =
        'State is required.'
    } else if (
      state.length < 2 ||
      state.length > 50
    ) {
      validationErrors.state =
        'Please enter a valid state.'
    }

    if (!pincode) {
      validationErrors.pincode =
        'Pincode is required.'
    } else if (!/^\d{6}$/.test(pincode)) {
      validationErrors.pincode =
        'Pincode must be exactly 6 digits.'
    }

    setErrors(validationErrors)

    return (
      Object.keys(validationErrors).length === 0
    )
  }

  async function startPayment() {
    setShowPaymentConfirmation(false)
    setIsSubmitting(true)

    try {
      let marketplaceOrder =
        pendingOrder

      /*
       * First payment attempt:
       *
       * Create the Marketplace order only when
       * there is no existing pending order.
       *
       * Retry:
       *
       * Reuse the existing pending Marketplace
       * order instead of creating another one.
       */
      if (!marketplaceOrder) {
        const orderItems = cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))

        const data = await apiRequest(
          '/orders',
          {
            method: 'POST',
            token,
            body: {
              customer: formData,
              items: orderItems,
            },
          },
        )

        marketplaceOrder =
          data?.order ?? null

        if (!marketplaceOrder) {
          throw new Error(
            'Marketplace order could not be created.',
          )
        }

        /*
         * Keep the newly created Marketplace order
         * so cancelled/failed payment can be retried
         * against this same order.
         */
        setPendingOrder(
          marketplaceOrder,
        )
      }

      /*
       * Create/recreate the Razorpay payment order
       * for the existing Marketplace order.
       *
       * This is safe because the backend only allows
       * payment creation while the Marketplace order
       * is PENDING.
       */
      const paymentData =
        await apiRequest(
          '/payments/create-order',
          {
            method: 'POST',
            token,
            body: {
              orderId:
                marketplaceOrder.id,
            },
          },
        )

      const paymentOrder =
        paymentData?.paymentOrder ?? null

      if (!paymentOrder) {
        throw new Error(
          'Payment order could not be created.',
        )
      }

      if (
        !paymentOrder.razorpayOrderId
      ) {
        throw new Error(
          'Razorpay order ID was not returned.',
        )
      }

      /*
       * Open Razorpay Checkout.
       */
      const razorpayOptions = {
        key:
          import.meta.env
            .VITE_RAZORPAY_KEY_ID,

        amount:
          paymentOrder.amount,

        currency:
          paymentOrder.currency || 'INR',

        name:
          'Market Palce',

        description:
          'Website Marketplace Purchase',

        order_id:
          paymentOrder.razorpayOrderId,

        prefill: {
          name:
            formData.fullName,

          email:
            formData.email,

          contact:
            formData.phone,
        },

        notes: {
          marketplaceOrderId:
            marketplaceOrder.id,
        },

        theme: {
          color: '#008080',
        },

        handler:
          async function (
            razorpayResponse,
          ) {
            try {
              setOrderError('')

              /*
               * Verify Razorpay payment against
               * the SAME Marketplace order.
               */
              const verificationData =
                await apiRequest(
                  '/payments/verify',
                  {
                    method: 'POST',
                    token,
                    body: {
                      orderId:
                        marketplaceOrder.id,

                      razorpayOrderId:
                        razorpayResponse.razorpay_order_id,

                      razorpayPaymentId:
                        razorpayResponse.razorpay_payment_id,

                      razorpaySignature:
                        razorpayResponse.razorpay_signature,
                    },
                  },
                )

              const verification =
                verificationData?.verification

              if (
                !verification?.verified ||
                verification.status !== 'PAID'
              ) {
                throw new Error(
                  'Payment verification failed.',
                )
              }

              /*
               * Payment has now been verified by
               * the backend.
               *
               * Only now is it safe to clear the
               * shopping cart.
               */
              clearCart()

              /*
               * The Marketplace order has now
               * successfully completed payment.
               */
              setOrder({
                ...marketplaceOrder,

                status:
                  verification.status,

                razorpayOrderId:
                  verification.razorpayOrderId,

                razorpayPaymentId:
                  verification.razorpayPaymentId,
              })

              /*
               * No longer keep the order as pending
               * in frontend state.
               */
              setPendingOrder(null)
            } catch (verificationError) {
              setOrderError(
                verificationError.message ||
                  'Payment was received, but verification failed. Please contact support.',
              )
            } finally {
              setIsSubmitting(false)
            }
          },

        modal: {
          ondismiss:
            function () {
              /*
               * IMPORTANT:
               *
               * Do NOT clear pendingOrder here.
               *
               * The Marketplace order remains PENDING
               * and can be reused for the next payment
               * attempt.
               */
              setIsSubmitting(false)

              setOrderError(
                'Payment was cancelled. Your order is still pending and you can try again.',
              )
            },
        },
      }

      const razorpay =
        new window.Razorpay(
          razorpayOptions,
        )

      razorpay.on(
        'payment.failed',
        function (paymentFailure) {
          /*
           * Keep pendingOrder intact.
           *
           * The buyer can retry payment using the
           * SAME Marketplace order.
           */
          setIsSubmitting(false)

          const failureMessage =
            paymentFailure?.error?.description ||
            'Payment failed. Please try again.'

          setOrderError(
            failureMessage,
          )
        },
      )

      razorpay.open()
    } catch (requestError) {
      setOrderError(
        requestError.message ||
          'Failed to start payment. Please try again.',
      )

      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setOrderError('')

    if (!validateForm()) {
      return
    }

    if (!isAuthenticated || !token) {
      setOrderError(
        'Please log in before placing your order.',
      )

      return
    }

    if (cart.length === 0 && !pendingOrder) {
      setOrderError(
        'Your cart is empty.',
      )

      return
    }

    if (
      !import.meta.env.VITE_RAZORPAY_KEY_ID
    ) {
      setOrderError(
        'Razorpay is not configured. Please contact support.',
      )

      return
    }

    if (!window.Razorpay) {
      setOrderError(
        'Razorpay Checkout is still loading. Please try again in a moment.',
      )

      return
    }

    /*
     * Do not start payment immediately.
     *
     * First show the buyer a final confirmation
     * asking them to check their details.
     */
    setShowPaymentConfirmation(true)
  }

  if (cart.length === 0 && !order) {
    return (
      <main className="checkout-page">
        <header className="checkout-header">
          <Link
            to="/"
            className="checkout-logo"
          >
            Market Palce
          </Link>

          <nav className="checkout-nav">
            <Link to="/">
              Home
            </Link>

            <Link to="/products">
              Products
            </Link>

            <Link to="/account">
              Account
            </Link>
          </nav>
        </header>

        <section className="checkout-empty">
          <span className="checkout-eyebrow">
            CHECKOUT
          </span>

          <h1>
            Your cart is empty
          </h1>

          <p>
            Add a product to your cart before
            continuing to checkout.
          </p>

          <Link
            to="/products"
            className="checkout-primary-button"
          >
            Browse Products
          </Link>
        </section>

        <footer className="checkout-footer">
          <Link
            to="/"
            className="checkout-logo"
          >
            Market Palce
          </Link>

          <span>
            © {new Date().getFullYear()} Market Palce
          </span>
        </footer>
      </main>
    )
  }

  if (order) {
    return (
      <main className="checkout-page">
        <header className="checkout-header">
          <Link
            to="/"
            className="checkout-logo"
          >
            Market Palce
          </Link>

          <nav className="checkout-nav">
            <Link to="/">
              Home
            </Link>

            <Link to="/products">
              Products
            </Link>

            <Link to="/account">
              Account
            </Link>
          </nav>
        </header>

        <section className="checkout-empty">
          <span className="checkout-eyebrow">
            PAYMENT SUCCESSFUL
          </span>

          <h1>
            Payment completed successfully
          </h1>

          <p>
            Your payment has been verified and
            your website purchase is now confirmed.
          </p>

          <div
            style={{
              marginBottom: '25px',
              color: '#008080',
              fontWeight: 800,
            }}
          >
            Order ID: {order.id}
          </div>

          <div
            style={{
              marginBottom: '15px',
              color: '#315353',
              fontSize: '1.1rem',
              fontWeight: 700,
            }}
          >
            Total: ₹{Number(
              order.totalAmount,
            ).toLocaleString('en-IN')}
          </div>

          <div
            style={{
              marginBottom: '30px',
              color: '#008080',
              fontSize: '1rem',
              fontWeight: 800,
            }}
          >
            Payment Status: PAID
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="checkout-primary-button"
              onClick={() =>
                navigate('/account')
              }
            >
              View My Orders
            </button>

            <Link
              to="/products"
              className="checkout-primary-button"
            >
              Continue Shopping
            </Link>
          </div>
        </section>

        <footer className="checkout-footer">
          <Link
            to="/"
            className="checkout-logo"
          >
            Market Palce
          </Link>

          <span>
            © {new Date().getFullYear()} Market Palce
          </span>
        </footer>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link
          to="/"
          className="checkout-logo"
        >
          Market Palce
        </Link>

        <nav className="checkout-nav">
          <Link to="/">
            Home
          </Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/account">
            Account
          </Link>
        </nav>
      </header>

      <div className="checkout-container">
        <div className="checkout-breadcrumb">
          <Link to="/cart">
            Cart
          </Link>

          <span>/</span>

          <span>
            Checkout
          </span>
        </div>

        <div className="checkout-heading">
          <span className="checkout-eyebrow">
            MARKETPLACE
          </span>

          <h1>
            Checkout
          </h1>

          <p>
            Complete your details to place your
            order.
          </p>
        </div>

        {!isAuthenticated ? (
          <section
            style={{
              maxWidth: '720px',
              margin: '0 auto 40px',
              padding: '40px 30px',
              borderRadius: '20px',
              background: '#ffffff',
              border: '1px solid #dbe7e7',
              boxShadow:
                '0 18px 45px rgba(0, 80, 80, 0.08)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: '#e8f7f6',
                display: 'grid',
                placeItems: 'center',
                color: '#008080',
                fontSize: '28px',
                fontWeight: 800,
              }}
            >
              🔐
            </div>

            <span
              style={{
                display: 'block',
                marginBottom: '10px',
                color: '#008080',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
              }}
            >
              LOGIN REQUIRED
            </span>

            <h2
              style={{
                margin: '0 0 12px',
                color: '#163636',
                fontSize: '1.7rem',
              }}
            >
              Please log in to continue
            </h2>

            <p
              style={{
                maxWidth: '520px',
                margin: '0 auto 25px',
                color: '#5f7373',
                lineHeight: 1.7,
              }}
            >
              You can keep products in your cart as a
              guest, but you must log in before
              purchasing.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/login"
                className="checkout-primary-button"
              >
                Log In to Continue
              </Link>

              <Link
                to="/cart"
                className="checkout-back-cart"
              >
                Back to Cart
              </Link>
            </div>
          </section>
        ) : (
          <>
            {orderError && (
              <div
                style={{
                  marginBottom: '25px',
                  padding: '16px 18px',
                  borderRadius: '12px',
                  background: '#fff1f1',
                  border: '1px solid #e4aaaa',
                  color: '#9b2c2c',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
                role="alert"
              >
                {orderError}
              </div>
            )}

            <form
              className="checkout-content"
              onSubmit={handleSubmit}
            >
              <section className="checkout-form-section">
                <div className="checkout-card">
                  <div className="checkout-card-heading">
                    <span>
                      01
                    </span>

                    <div>
                      <h2>
                        Customer Information
                      </h2>

                      <p>
                        Enter the details we'll use
                        for your order.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-form-grid">
                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="fullName">
                        Full Name
                      </label>

                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        maxLength="80"
                        required
                        aria-invalid={Boolean(
                          errors.fullName,
                        )}
                      />

                      {errors.fullName && (
                        <span className="checkout-field-error">
                          {errors.fullName}
                        </span>
                      )}
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="email">
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        aria-invalid={Boolean(
                          errors.email,
                        )}
                      />

                      {errors.email && (
                        <span className="checkout-field-error">
                          {errors.email}
                        </span>
                      )}
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="phone">
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter 10-digit mobile number"
                        maxLength="10"
                        inputMode="numeric"
                        required
                        aria-invalid={Boolean(
                          errors.phone,
                        )}
                      />

                      {errors.phone && (
                        <span className="checkout-field-error">
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="checkout-card">
                  <div className="checkout-card-heading">
                    <span>
                      02
                    </span>

                    <div>
                      <h2>
                        Billing Information
                      </h2>

                      <p>
                        Enter your billing details.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-form-grid">
                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="address">
                        Address
                      </label>

                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your complete address"
                        rows="4"
                        maxLength="250"
                        required
                        aria-invalid={Boolean(
                          errors.address,
                        )}
                      />

                      {errors.address && (
                        <span className="checkout-field-error">
                          {errors.address}
                        </span>
                      )}
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="city">
                        City
                      </label>

                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        maxLength="50"
                        required
                        aria-invalid={Boolean(
                          errors.city,
                        )}
                      />

                      {errors.city && (
                        <span className="checkout-field-error">
                          {errors.city}
                        </span>
                      )}
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="state">
                        State
                      </label>

                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        maxLength="50"
                        required
                        aria-invalid={Boolean(
                          errors.state,
                        )}
                      />

                      {errors.state && (
                        <span className="checkout-field-error">
                          {errors.state}
                        </span>
                      )}
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="pincode">
                        Pincode
                      </label>

                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Enter 6-digit pincode"
                        maxLength="6"
                        inputMode="numeric"
                        required
                        aria-invalid={Boolean(
                          errors.pincode,
                        )}
                      />

                      {errors.pincode && (
                        <span className="checkout-field-error">
                          {errors.pincode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="checkout-summary">
                <span className="checkout-summary-label">
                  ORDER SUMMARY
                </span>

                <h2>
                  Your Order
                </h2>

                <div className="checkout-summary-items">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="checkout-summary-item"
                    >
                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <strong>
                        ₹{Number(
                          item.price * item.quantity,
                        ).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-divider" />

                <div className="checkout-summary-row">
                  <span>
                    Items
                  </span>

                  <strong>
                    {totalItems}
                  </strong>
                </div>

                <div className="checkout-summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹{Number(
                      subtotal,
                    ).toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="checkout-summary-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    ₹{Number(
                      subtotal,
                    ).toLocaleString('en-IN')}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="checkout-place-order-button"
                  disabled={
                    isSubmitting ||
                    !isAuthenticated
                  }
                >
                  {isSubmitting
                    ? 'Starting Payment...'
                    : pendingOrder
                      ? 'Retry Payment'
                      : 'Proceed to Payment'}
                </button>

                <Link
                  to="/cart"
                  className="checkout-back-cart"
                >
                  ← Back to Cart
                </Link>

                <p className="checkout-security-note">
                  Your payment is securely processed
                  through Razorpay.
                </p>
              </aside>
            </form>
          </>
        )}
      </div>

      <footer className="checkout-footer">
        <Link
          to="/"
          className="checkout-logo"
        >
          Market Palce
        </Link>

        <span>
          © {new Date().getFullYear()} Market Palce
        </span>
      </footer>

      {showPaymentConfirmation && (
        <div
          className="checkout-confirmation-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-confirmation-title"
        >
          <div className="checkout-confirmation-modal">
            <div className="checkout-confirmation-icon">
              !
            </div>

            <span className="checkout-confirmation-eyebrow">
              BEFORE PAYMENT
            </span>

            <h2 id="checkout-confirmation-title">
              Please check your details
            </h2>

            <p className="checkout-confirmation-message">
              Please make sure you entered the correct
              details. Your payment receipt and order
              confirmation will be sent to this email
              address.
            </p>

            <div className="checkout-confirmation-email">
              {formData.email.trim()}
            </div>

            <div className="checkout-confirmation-actions">
              <button
                type="button"
                className="checkout-confirmation-back"
                onClick={() =>
                  setShowPaymentConfirmation(false)
                }
              >
                Go Back
              </button>

              <button
                type="button"
                className="checkout-confirmation-continue"
                onClick={startPayment}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}