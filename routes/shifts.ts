import { type NextFunction, type Request, type Response, Router } from 'express'

import handler_edit from '../handlers/shifts-get/edit.js'
import handler_new from '../handlers/shifts-get/new.js'
import handler_search from '../handlers/shifts-get/search.js'
import handler_view from '../handlers/shifts-get/view.js'
import handler_doCreateShift from '../handlers/shifts-post/doCreateShift.js'
import handler_doSearchShifts from '../handlers/shifts-post/doSearchShifts.js'
import handler_doUpdateShift from '../handlers/shifts-post/doUpdateShift.js'

function updateHandler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response,
  next: NextFunction
): void {
  if (request.session.user?.userProperties.shifts.canUpdate ?? false) {
    next()
  } else {
    response.status(403).send('Forbidden')
  }
}

export const router = Router()

router.get('/', handler_search).post('/doSearchShifts', handler_doSearchShifts)

router
  .get('/new', updateHandler, handler_new)
  .post('/doCreateShift', updateHandler, handler_doCreateShift)

router
  .get('/:shiftId/edit', updateHandler, handler_edit)
  .post('/doUpdateShift', updateHandler, handler_doUpdateShift)

router.get('/:shiftId', handler_view)

export default router
