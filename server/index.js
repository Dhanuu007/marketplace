import { createApp } from './app.js'
import { closeDatabase, connectDatabase } from './db/mongo.js'
import { env, validateProductionEnv } from './config/env.js'

validateProductionEnv()

try {
  await connectDatabase()

  console.log('MongoDB connected ✅')
} catch (error) {
  console.error(`MongoDB connection failed: ${error.message}`)

  if (env.nodeEnv === 'production') {
    process.exit(1)
  }
}

const app = createApp()
const server = app.listen(
  env.port,
  '0.0.0.0',
  () => {
    console.log(
      `API server listening on http://0.0.0.0:${env.port}`,
    )
  },
)

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down API server`)

  server.close(async () => {
    await closeDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
