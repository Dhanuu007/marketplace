import { Router } from 'express'
import { env } from '../../config/env.js'
import { checkDatabaseHealth } from '../../db/mongo.js'

const router = Router()

router.get('/health', async (request, response) => {
  const database = await checkDatabaseHealth()

  response.json({
    status: 'ok',
    service: 'market-palce-api',
    environment: env.nodeEnv,
    database,
  })
})

export default router
