import { Router } from 'express'

import {
  validateChatbotMessage,
} from './chatbot.validation.js'

import {
  streamChatbotMessage,
} from './chatbot.service.js'


const router = Router()


/*
 * Public MarketPalce Assistant.
 *
 * Authentication is intentionally NOT required.
 *
 * The response is streamed from Gemini
 * to the browser progressively.
 */
router.post(
  '/chatbot/message',
  async (request, response, next) => {

    try {

      const input =
        validateChatbotMessage(
          request.body,
        )


      const stream =
        await streamChatbotMessage(
          input.message,
        )


      response.setHeader(
        'Content-Type',
        'text/event-stream; charset=utf-8',
      )

      response.setHeader(
        'Cache-Control',
        'no-cache, no-transform',
      )

      response.setHeader(
        'Connection',
        'keep-alive',
      )

      response.setHeader(
        'X-Accel-Buffering',
        'no',
      )

      response.flushHeaders?.()


      for await (const event of stream) {

        if (
          event?.event_type ===
            'step.delta' &&
          event?.delta?.type ===
            'text' &&
          event?.delta?.text
        ) {

          response.write(
            `data: ${JSON.stringify({
              text: event.delta.text,
            })}\n\n`,
          )

        }

      }


      response.write(
        `data: ${JSON.stringify({
          done: true,
        })}\n\n`,
      )


      response.end()

    } catch (error) {

      console.error(
        '[Chatbot Error]',
        error,
      )


      if (response.headersSent) {

        response.write(
          `data: ${JSON.stringify({
            error:
              error?.message ??
              'Something went wrong.',
          })}\n\n`,
        )

        response.end()

        return
      }


      next(error)

    }

  },
)


export default router