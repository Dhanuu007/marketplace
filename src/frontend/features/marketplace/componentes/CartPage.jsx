import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getCart,
  removeFromCart,
} from '../cart/cartService.js'

import './CartPage.css'

export function CartPage() {
  const [cart, setCart] = useState(getCart)

  useEffect(() => {
    function handleCartUpdate(event) {
      setCart(event.detail || [])
    }

    window.addEventListener(
      'marketplace-cart-updated',
      handleCartUpdate,
    )

    return () => {
      window.removeEventListener(
        'marketplace-cart-updated',
        handleCartUpdate,
      )
    }
  }, [])

  function handleRemove(productId) {
    const updatedCart = removeFromCart(productId)

    setCart(updatedCart)
  }

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price,
    0,
  )

  const totalItems = cart.length

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <header className="cart-header">
          <Link
            to="/"
            className="cart-logo"
          >
            Market Palce
          </Link>

          <nav className="cart-nav">
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

        <section className="cart-empty">
          <span className="cart-eyebrow">
            MARKETPLACE
          </span>

          <h1>
            Your cart is empty
          </h1>

          <p>
            You haven't added any products to
            your cart yet.
          </p>

          <Link
            to="/products"
            className="cart-primary-button"
          >
            Browse Products
          </Link>
        </section>

        <footer className="cart-footer">
          <Link
            to="/"
            className="cart-logo"
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
    <main className="cart-page">
      <header className="cart-header">
        <Link
          to="/"
          className="cart-logo"
        >
          Market Palce
        </Link>

        <nav className="cart-nav">
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

      <div className="cart-container">
        <div className="cart-breadcrumb">
          <Link to="/">
            Marketplace
          </Link>

          <span>/</span>

          <span>
            Cart
          </span>
        </div>

        <section className="cart-content">
          <div className="cart-items-section">
            <div className="cart-title-row">
              <div>
                <span className="cart-eyebrow">
                  MARKETPLACE
                </span>

                <h1>
                  Shopping Cart
                </h1>
              </div>

              <span className="cart-item-count">
                {totalItems}{' '}
                {totalItems === 1
                  ? 'website'
                  : 'websites'}
              </span>
            </div>

            <div className="cart-items">
              {cart.map((item) => (
                <article
                  key={item.productId}
                  className="cart-item"
                >
                  <div className="cart-item-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>
                        WEBSITE
                      </span>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h2>
                      {item.name}
                    </h2>

                    <span>
                      Website Listing
                    </span>

                    <strong>
                      ₹{Number(
                        item.price,
                      ).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="cart-item-actions">
                    <span className="cart-purchase-label">
                      1 website
                    </span>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() =>
                        handleRemove(
                          item.productId,
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item-total">
                    ₹{Number(
                      item.price,
                    ).toLocaleString('en-IN')}
                  </div>
                </article>
              ))}
            </div>

            <Link
              to="/products"
              className="cart-continue-link"
            >
              ← Continue Shopping
            </Link>
          </div>

          <aside className="cart-summary">
            <span className="cart-summary-label">
              ORDER SUMMARY
            </span>

            <h2>
              Cart Summary
            </h2>

            <div className="cart-summary-row">
              <span>
                Websites
              </span>

              <strong>
                {totalItems}
              </strong>
            </div>

            <div className="cart-summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                ₹{Number(
                  subtotal,
                ).toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>
                Total
              </span>

              <strong>
                ₹{Number(
                  subtotal,
                ).toLocaleString('en-IN')}
              </strong>
            </div>

            <Link
              to="/checkout"
              className="cart-checkout-button"
            >
              Proceed to Checkout
            </Link>

            <p className="cart-summary-note">
              Each website listing can be
              purchased once per order.
            </p>
          </aside>
        </section>
      </div>

      <footer className="cart-footer">
        <Link
          to="/"
          className="cart-logo"
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