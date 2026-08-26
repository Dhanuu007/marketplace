const CART_STORAGE_KEY = 'marketplace_cart'

function getStoredCart() {
  try {
    const storedCart = localStorage.getItem(
      CART_STORAGE_KEY,
    )

    if (!storedCart) {
      return []
    }

    const parsedCart = JSON.parse(storedCart)

    return Array.isArray(parsedCart)
      ? parsedCart
      : []
  } catch (error) {
    console.error(
      'Failed to read cart:',
      error,
    )

    return []
  }
}

function saveCart(cart) {
  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(cart),
  )

  window.dispatchEvent(
    new CustomEvent(
      'marketplace-cart-updated',
      {
        detail: cart,
      },
    ),
  )
}

export function getCart() {
  return getStoredCart()
}

export function addToCart(product) {
  if (!product?._id) {
    return getStoredCart()
  }

  const cart = getStoredCart()

  const existingItem = cart.find(
    (item) =>
      item.productId === product._id,
  )

  if (existingItem) {
    return cart
  }

  cart.push({
    productId: product._id,
    name: product.name,
    price: Number(product.price) || 0,
    image: product.image || '',
    quantity: 1,
  })

  saveCart(cart)

  return cart
}

export function removeFromCart(productId) {
  const cart = getStoredCart()

  const updatedCart = cart.filter(
    (item) =>
      item.productId !== productId,
  )

  saveCart(updatedCart)

  return updatedCart
}

export function clearCart() {
  saveCart([])

  return []
}

export function getCartCount() {
  return getStoredCart().reduce(
    (total, item) =>
      total + item.quantity,
    0,
  )
}

export function getCartTotal() {
  return getStoredCart().reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0,
  )
}