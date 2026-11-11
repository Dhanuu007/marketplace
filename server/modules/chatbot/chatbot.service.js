
import { GoogleGenAI } from '@google/genai'

import {
  getUserMemories,
} from './chatbotMemory.repository.js'

import {
  processUserMemory,
} from './chatbotMemory.service.js'


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})


const MARKETPALCE_INSTRUCTIONS = `
You are the MarketPalce Assistant.

MarketPalce is a digital marketplace where creators can list ready-made websites and buyers can purchase them.

Your job is to help users understand and use the REAL MarketPalce features listed below.

IMPORTANT ACCURACY RULES:

- Only describe MarketPalce functionality that is explicitly listed in these instructions.
- Do not invent pages, buttons, features, workflows, policies, prices, guarantees, or capabilities.
- Do not use generic marketplace functionality as if it definitely exists on MarketPalce.
- If the user asks about something that is not covered here, say that you do not have enough information.
- Do not claim that you performed an action for the user when you did not actually perform it.
- Do not ask users for passwords, authentication tokens, bank account numbers, IFSC codes, UPI IDs, or other sensitive credentials.
- Keep responses friendly, clear, and concise.
- Use the actual MarketPalce terminology whenever possible.

GENERAL MARKETPLACE FEATURES:

- Visitors can browse websites and digital products.
- Product details can be viewed before purchasing.
- Products can be added to the cart.
- Buyers can proceed through checkout.
- Buyers can purchase products.
- Buyers can view their orders.
- After a website has been delivered, buyers can download the delivered website.
- Buyers can communicate with creators through the messaging system.
- Users have an Account page for account-related functionality.

BUYER FEATURES:

Buyer Dashboard:
- Browse Websites
- My Orders
- Messages
- My Account

Buyer routes:
- Browse Websites: /products
- Cart: /cart
- Checkout: /checkout
- My Orders: /buyer/orders
- Messages: /buyer/chat
- My Account: /account

Buyer Orders:
- Buyers can view their orders.
- Buyers can see whether delivery is pending or completed.
- When a purchased website has been delivered, the buyer can download it.
- Buyers can chat with the creator for eligible orders.

CREATOR FEATURES:

Creator Dashboard:
- Creators can manage their website listings.
- Creators can view their orders.
- Creators can provide delivery for purchased websites.
- Creators can view earnings and payouts.
- Creators can communicate with buyers.
- Creators can manage their account-related information.

Creator routes:
- Creator Dashboard: /creator/dashboard
- Add Website Listing: /creator/listings/new
- Creator Orders: /creator/orders
- Earnings & Payouts: /creator/finances
- Payment Settings: /creator/payment-settings
- Automated Payouts: /creator/automated-payouts
- Creator Messages: /creator/chat

CREATOR WEBSITE LISTING:

The actual page is called "Add Website Listing".

A Creator can provide:

- Website Name
- Description
- Website Category
- Technology
- Demo / Live Website URL
- Website screenshots
- Website source ZIP
- Website price in Indian Rupees

Listing requirements:
- Up to 5 screenshots can be selected.
- Screenshots can be JPG, PNG, or WebP.
- The website source file must be a ZIP file.
- The website ZIP can be up to 500 MB.
- After submission, the website listing is reviewed by the administrator before it becomes visible to buyers.

Do not describe unsupported listing actions such as publishing, unpublishing, deleting, or replacing product files unless the user provides information about such functionality.

CREATOR ORDERS AND DELIVERY:

Creators can open Creator Orders to view website orders.

For purchased websites that require delivery, the Creator can provide:

- Website source ZIP
- Demo / Live URL
- Instructions
- Support Information

The website delivery ZIP must be a ZIP file and can be up to 500 MB.

CREATOR EARNINGS:

The Earnings & Payouts page shows:

- Gross Sales
- Marketplace Fees
- Your Earnings
- Pending Payout

The Creator share is 95% and the Marketplace commission is 5%.

Creators can also view payout history and payout status.

PAYMENT SETTINGS:

Creators have a Payment Settings page where they can manage payout information.

Never ask the Creator to provide sensitive payment details inside the chatbot.

AUTOMATED PAYOUTS:

The Automated Payouts page currently does NOT activate automated Razorpay payouts.

Automated Razorpay payouts are currently unavailable.

The current payout method is manual payout by the MarketPalce Admin using the saved payout details.

Do not claim that automated payouts are currently active.

ROLE RESTRICTIONS:

- Buyer-only functionality must not be presented as Creator functionality.
- Creator-only functionality must not be presented as Buyer functionality.
- If a user asks about another role's feature, explain that the feature belongs to that role.
- Never assume that a guest has access to authenticated Buyer or Creator features.

If a question is unrelated to MarketPalce, politely explain that you are the MarketPalce Assistant and are primarily here to help with MarketPalce.
`


function getRoleInstructions(user) {
  if (user?.role === 'BUYER') {
    return `
The current user is a BUYER.

You are assisting this user from the Buyer side of MarketPalce.

Prioritize:
- Browsing websites
- Product details
- Cart
- Checkout
- Purchases
- My Orders
- Delivery status
- Downloading delivered websites
- Messages with creators
- My Account

Do not describe Creator Dashboard, Creator Listings, Creator Orders, Creator Earnings, Creator Payment Settings, or other Creator-only functionality as if the Buyer can use them.
`
  }

  if (user?.role === 'CREATOR') {
    return `
The current user is a CREATOR.

You are assisting this user from the Creator side of MarketPalce.

Prioritize:
- Creator Dashboard
- Add Website Listing
- Managing website listings
- Creator Orders
- Providing website delivery
- Earnings & Payouts
- Payment Settings
- Payout information
- Creator Messages

When explaining how to create a listing, use the actual "Add Website Listing" page and the actual fields and requirements described in the MarketPalce instructions.

Do not describe Buyer-only functionality as if the Creator can use it.
`
  }

  return `
The current user is a GUEST who is not logged in.

Provide general MarketPalce information suitable for a visitor.

Do not assume that the guest has access to authenticated Buyer or Creator features.
`
}


// ========================================
// GEMINI RETRY CONFIGURATION
// ========================================

const GEMINI_MAX_ATTEMPTS = 3

const BASE_RETRY_DELAY_MS = 1000


function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}


function getGeminiStatus(error) {
  const status =
    error?.statusCode ??
    error?.status ??
    error?.cause?.statusCode ??
    error?.cause?.status

  return Number(status) || null
}


function getRetryAfterMs(error) {
  const headers =
    error?.headers ??
    error?.rawResponse?.headers ??
    error?.cause?.headers ??
    error?.cause?.rawResponse?.headers

  const retryAfter =
    headers?.get?.('retry-after') ??
    headers?.['retry-after']

  if (!retryAfter) {
    return 0
  }

  const seconds = Number(retryAfter)

  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000)
  }

  const date = Date.parse(retryAfter)

  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now())
  }

  return 0
}


function isRetryableGeminiError(error) {
  const status = getGeminiStatus(error)

  return (
    status === 429 ||
    (status !== null && status >= 500 && status <= 599)
  )
}


// ========================================
// GEMINI STREAMING WITH RETRIES
// ========================================

async function* createGeminiStreamWithRetry(payload) {
  for (
    let attempt = 1;
    attempt <= GEMINI_MAX_ATTEMPTS;
    attempt++
  ) {
    let emittedText = false

    try {
      console.log(
        `[Chatbot] Gemini request attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}`,
      )

      // Use the standard Gemini streaming API.
      // Each retry creates a fresh request.

      const stream = await ai.models.generateContentStream(
        payload,
      )

      for await (const chunk of stream) {
        const text = chunk.text

        if (text) {
          emittedText = true

          yield {
            event_type: 'step.delta',
            delta: {
              type: 'text',
              text,
            },
          }
        }
      }

      // Successful completion.
      return

    } catch (error) {
      const status = getGeminiStatus(error)

      console.error(
        '[Chatbot] Gemini stream error:',
        {
          status,
          message: error?.message,
          attempt,
        },
      )

      // Never retry after text has already
      // been sent to the user.
      if (emittedText) {
        throw error
      }

      const canRetry =
        isRetryableGeminiError(error) &&
        attempt < GEMINI_MAX_ATTEMPTS

      if (canRetry) {
        const exponentialDelay =
          BASE_RETRY_DELAY_MS *
          Math.pow(2, attempt - 1)

        const retryAfter =
          getRetryAfterMs(error)

        const delay = Math.max(
          exponentialDelay,
          retryAfter,
        )

        console.warn(
          `[Chatbot] Gemini returned ${status}. Retrying in ${delay / 1000} seconds.`,
        )

        await wait(delay)

        continue
      }

      // All retries exhausted.
      if (isRetryableGeminiError(error)) {
        console.error(
          '[Chatbot] All Gemini retry attempts failed.',
        )

        yield {
          event_type: 'error',
          error: {
            message: 'Gemini is temporarily unavailable.',
          },
        }

        return
      }

      // Non-retryable errors.
      throw error
    }
  }
}


// ========================================
// MAIN CHATBOT SERVICE
// ========================================

export async function streamChatbotMessage(
  message,
  user,
) {

  // Process user memory.
  await processUserMemory({
    user,
    message,
  })


  // Get role-specific instructions.
  const roleInstructions =
    getRoleInstructions(user)


  // Load saved user memories.
  let memoryContext = ''

  if (user?.id) {
    const memories =
      await getUserMemories(user.id)

    if (memories.length > 0) {
      memoryContext = `

Known information about the user:
${memories
  .map(
    (memory) =>
      `- ${memory.key}: ${memory.value}`,
  )
  .join('\n')}
`
    }
  }


  // Prepare Gemini request.
  const payload = {
    model: 'gemini-3.6-flash',

    contents: `${memoryContext}

User message:
${message}`,

    config: {
      systemInstruction: `${MARKETPALCE_INSTRUCTIONS}

${roleInstructions}`,
    },
  }


  console.log(
    '[Chatbot] Starting Gemini response stream.',
  )


  // Return the streaming generator.
  return createGeminiStreamWithRetry(payload)
}
