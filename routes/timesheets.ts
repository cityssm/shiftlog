import { type NextFunction, type Request, type Response, Router } from 'express'

import handler_edit from '../handlers/timesheets-get/edit.js'
import handler_new from '../handlers/timesheets-get/new.js'
import handler_search from '../handlers/timesheets-get/search.js'
import handler_view from '../handlers/timesheets-get/view.js'
import handler_doAddTimesheetColumn from '../handlers/timesheets-post/doAddTimesheetColumn.js'
import handler_doAddTimesheetRow from '../handlers/timesheets-post/doAddTimesheetRow.js'
import handler_doCreateTimesheet from '../handlers/timesheets-post/doCreateTimesheet.js'
import handler_doGetTimesheetCells from '../handlers/timesheets-post/doGetTimesheetCells.js'
import handler_doGetTimesheetColumns from '../handlers/timesheets-post/doGetTimesheetColumns.js'
import handler_doGetTimesheetRows from '../handlers/timesheets-post/doGetTimesheetRows.js'
import handler_doSearchTimesheets from '../handlers/timesheets-post/doSearchTimesheets.js'
import handler_doUpdateTimesheet from '../handlers/timesheets-post/doUpdateTimesheet.js'
import handler_doUpdateTimesheetCell from '../handlers/timesheets-post/doUpdateTimesheetCell.js'

function updateHandler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response,
  next: NextFunction
): void {
  if (request.session.user?.userProperties.timesheets.canUpdate ?? false) {
    next()
  } else {
    response.status(403).send('Forbidden')
  }
}

export const router = Router()

router.get('/', handler_search).post('/doSearchTimesheets', handler_doSearchTimesheets)

router
  .get('/new', updateHandler, handler_new)
  .post('/doCreateTimesheet', updateHandler, handler_doCreateTimesheet)

router
  .get('/:timesheetId/edit', updateHandler, handler_edit)
  .post('/doUpdateTimesheet', updateHandler, handler_doUpdateTimesheet)

// Timesheet data endpoints
router.post('/doGetTimesheetColumns', handler_doGetTimesheetColumns)
router.post('/doGetTimesheetRows', handler_doGetTimesheetRows)
router.post('/doGetTimesheetCells', handler_doGetTimesheetCells)

router.post('/doAddTimesheetColumn', updateHandler, handler_doAddTimesheetColumn)
router.post('/doAddTimesheetRow', updateHandler, handler_doAddTimesheetRow)

router.post('/doUpdateTimesheetCell', updateHandler, handler_doUpdateTimesheetCell)

router.get('/:timesheetId', handler_view)

export default router
