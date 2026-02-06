import { type RequestHandler, Router } from 'express'

import handler_dataListItems from '../handlers/api-get/dataListItems.js'
import handler_reportKey from '../handlers/api-get/reportKey.js'
import handler_workOrder from '../handlers/api-get/workOrder.js'
import handler_workOrderDigest from '../handlers/api-get/workOrderDigest.js'
import { apiGetHandler } from '../handlers/permissions.js'

export const router = Router()

router.get(
  '/:apiKey/reports/:reportKey',
  apiGetHandler,
  handler_reportKey as RequestHandler
)

router.get(
  '/:apiKey/dataListItems/:dataListKey',
  apiGetHandler,
  handler_dataListItems
)

router.get(
  '/:apiKey/workOrders/:workOrderId.ics',
  apiGetHandler,
  handler_workOrder
)

router.get(
  '/:apiKey/workOrderDigest',
  apiGetHandler,
  handler_workOrderDigest
)

export default router
