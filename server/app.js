import cors from 'cors'
import express from 'express'
import path from 'path'

import {
  errorHandler,
  notFoundHandler,
} from './middleware/errors.js'

import { env } from './config/env.js'

import apiRoutes from './modules/index.js'


export function createApp() {
  const app = express()


  app.disable('x-powered-by')


  const allowedOrigins =
  env.nodeEnv === 'production'
    ? [
        env.clientOrigin,
        'http://localhost:5173',
        'http://192.168.1.8:5173',
      ]
    : [
        'http://localhost:5173',
        'http://192.168.1.8:5173',
      ]


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as health checks/server-to-server requests.
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(
        new Error(
          `CORS origin not allowed: ${origin}`,
        ),
      )
    },

    credentials: true,
  }),
)


  app.use(
  express.json({
    limit: '1mb',

    verify: (request, response, buffer) => {
      request.rawBody = buffer
    },
  }),
)


  // Uploaded website screenshots

  app.use(
    '/uploads/screenshots',
    express.static(
      path.resolve(
        process.cwd(),
        'server',
        'uploads',
        'screenshots',
      ),
    ),
  )


  app.use(
    '/api',
    apiRoutes,
  )


  app.use(notFoundHandler)

  app.use(errorHandler)


  return app
}