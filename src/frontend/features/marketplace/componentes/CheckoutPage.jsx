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
  const [orderError, setOrderError] = useState('')

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


    if (orderError) {
      setOrderError('')
    }
  }


  async function handleSubmit(event) {
    event.preventDefault()

    setOrderError('')


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


        {!isAuthenticated && (
          <div
            style={{
              marginBottom: '25px',
              padding: '16px 18px',
              borderRadius: '12px',
              background: '#fff7e6',
              border: '1px solid #f0d79a',
              color: '#725719',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px',
              flexWrap: 'wrap',
            }}
          >
            <span>
              Please log in before placing an order.
            </span>


            <Link
              to="/login"
              style={{
                color: '#008080',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Login
            </Link>
          </div>
        )}


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
                    required
                  />
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
                  />
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
                    placeholder="Enter phone number"
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                    placeholder="Enter pincode"
                    required
                  />
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
    </main>
  )
}