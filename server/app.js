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
    ? [env.clientOrigin]
    : [
        'http://localhost:5173',
        'http://192.168.1.8:5173',
      ]


      app.get('/debug-app', (request, response) => {
  response.json({
    status: 'ok',
    message: 'createApp is using this app.js',
  })
})


  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  )


  app.use(
    express.json({
      limit: '1mb',
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