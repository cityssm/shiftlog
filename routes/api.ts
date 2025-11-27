import { type RequestHandler, Router } from 'express'

import handler_reportKey from '../handlers/api-get/reportKey.js'
import { apiGetHandler } from '../handlers/permissions.js'

export const router = Router()

router.get(
  '/:apiKey/reports/:reportKey',
  apiGetHandler,
  handler_reportKey as RequestHandler
)

export default router
