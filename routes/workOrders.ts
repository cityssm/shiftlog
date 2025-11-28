import { type NextFunction, type Request, type Response, Router } from 'express'

import handler_edit from '../handlers/workOrders-get/edit.js'
import handler_map from '../handlers/workOrders-get/map.js'
import handler_new from '../handlers/workOrders-get/new.js'
import handler_print from '../handlers/workOrders-get/print.js'
import handler_search from '../handlers/workOrders-get/search.js'
import handler_view from '../handlers/workOrders-get/view.js'
import handler_doCreateWorkOrder from '../handlers/workOrders-post/doCreateWorkOrder.js'
import handler_doCreateWorkOrderMilestone from '../handlers/workOrders-post/doCreateWorkOrderMilestone.js'
import handler_doCreateWorkOrderNote from '../handlers/workOrders-post/doCreateWorkOrderNote.js'
import handler_doDeleteWorkOrder from '../handlers/workOrders-post/doDeleteWorkOrder.js'
import handler_doDeleteWorkOrderMilestone from '../handlers/workOrders-post/doDeleteWorkOrderMilestone.js'
import handler_doDeleteWorkOrderNote from '../handlers/workOrders-post/doDeleteWorkOrderNote.js'
import handler_doGetLocationSuggestions from '../handlers/workOrders-post/doGetLocationSuggestions.js'
import handler_doGetRequestorSuggestions from '../handlers/workOrders-post/doGetRequestorSuggestions.js'
import handler_doGetWorkOrderMilestones from '../handlers/workOrders-post/doGetWorkOrderMilestones.js'
import handler_doGetWorkOrderNotes from '../handlers/workOrders-post/doGetWorkOrderNotes.js'
import handler_doSearchWorkOrders from '../handlers/workOrders-post/doSearchWorkOrders.js'
import handler_doUpdateWorkOrder from '../handlers/workOrders-post/doUpdateWorkOrder.js'
import handler_doUpdateWorkOrderMilestone from '../handlers/workOrders-post/doUpdateWorkOrderMilestone.js'
import handler_doUpdateWorkOrderMilestoneOrder from '../handlers/workOrders-post/doUpdateWorkOrderMilestoneOrder.js'
import handler_doUpdateWorkOrderNote from '../handlers/workOrders-post/doUpdateWorkOrderNote.js'

function updateHandler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response,
  next: NextFunction
): void {
  if (request.session.user?.userProperties.workOrders.canUpdate ?? false) {
    next()
  } else {
    response.status(403).send('Forbidden')
  }
}

export const router = Router()

router
  .get('/', handler_search)
  .get('/map', handler_map)
  .post('/doSearchWorkOrders', handler_doSearchWorkOrders)

router
  .post('/doGetRequestorSuggestions', handler_doGetRequestorSuggestions)
  .post('/doGetLocationSuggestions', handler_doGetLocationSuggestions)

router
  .get('/new', updateHandler, handler_new)
  .post('/doCreateWorkOrder', updateHandler, handler_doCreateWorkOrder)

router
  .get('/:workOrderId/edit', updateHandler, handler_edit)
  .post('/doUpdateWorkOrder', updateHandler, handler_doUpdateWorkOrder)
  .post('/doDeleteWorkOrder', updateHandler, handler_doDeleteWorkOrder)

router
  .post('/:workOrderId/doGetWorkOrderNotes', handler_doGetWorkOrderNotes)
  .post('/doCreateWorkOrderNote', updateHandler, handler_doCreateWorkOrderNote)
  .post('/doUpdateWorkOrderNote', updateHandler, handler_doUpdateWorkOrderNote)
  .post('/doDeleteWorkOrderNote', updateHandler, handler_doDeleteWorkOrderNote)

router
  .post(
    '/:workOrderId/doGetWorkOrderMilestones',
    handler_doGetWorkOrderMilestones
  )
  .post(
    '/doCreateWorkOrderMilestone',
    updateHandler,
    handler_doCreateWorkOrderMilestone
  )
  .post(
    '/doUpdateWorkOrderMilestone',
    updateHandler,
    handler_doUpdateWorkOrderMilestone
  )
  .post(
    '/doDeleteWorkOrderMilestone',
    updateHandler,
    handler_doDeleteWorkOrderMilestone
  )
  .post(
    '/doUpdateWorkOrderMilestoneOrder',
    updateHandler,
    handler_doUpdateWorkOrderMilestoneOrder
  )

router.get('/:workOrderId/print', handler_print)

router.get('/:workOrderId', handler_view)

export default router
