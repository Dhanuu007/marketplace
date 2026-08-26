  function requiredString(value, fieldName) {
    if (
      typeof value !== 'string' ||
      value.trim() === ''
    ) {
      throw new Error(
        `${fieldName} is required.`,
      )
    }

    return value.trim()
  }


  export function validateCreateOrder(input = {}) {
    const customer = input.customer ?? {}
    const items = input.items ?? []


    if (!Array.isArray(items) || items.length === 0) {
      throw new Error(
        'At least one product is required.',
      )
    }


    const validatedItems = items.map((item) => {
      if (!item || typeof item !== 'object') {
        throw new Error(
          'Invalid order item.',
        )
      }


      const productId = requiredString(
        item.productId,
        'Product ID',
      )


      const quantity = Number(item.quantity)


      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error(
          'Product quantity must be a positive integer.',
        )
      }


      return {
        productId,
        quantity,
      }
    })


    return {
      customer: {
        fullName: requiredString(
          customer.fullName,
          'Full name',
        ),

        email: requiredString(
          customer.email,
          'Email',
        ),

        phone: requiredString(
          customer.phone,
          'Phone number',
        ),

        address: requiredString(
          customer.address,
          'Address',
        ),

        city: requiredString(
          customer.city,
          'City',
        ),

        state: requiredString(
          customer.state,
          'State',
        ),

        pincode: requiredString(
          customer.pincode,
          'Pincode',
        ),
      },

      items: validatedItems,
    }
  }