import { Router } from 'express';
import handler_edit from '../handlers/timesheets-get/edit.js';
import handler_new from '../handlers/timesheets-get/new.js';
import handler_recovery from '../handlers/timesheets-get/recovery.js';
import handler_search from '../handlers/timesheets-get/search.js';
import handler_view from '../handlers/timesheets-get/view.js';
import handler_doAddTimesheetColumn from '../handlers/timesheets-post/doAddTimesheetColumn.js';
import handler_doAddTimesheetRow from '../handlers/timesheets-post/doAddTimesheetRow.js';
import handler_doCopyFromPreviousTimesheet from '../handlers/timesheets-post/doCopyFromPreviousTimesheet.js';
import handler_doCopyFromShift from '../handlers/timesheets-post/doCopyFromShift.js';
import handler_doCreateTimesheet from '../handlers/timesheets-post/doCreateTimesheet.js';
import handler_doDeleteTimesheetColumn from '../handlers/timesheets-post/doDeleteTimesheetColumn.js';
import handler_doDeleteTimesheetRow from '../handlers/timesheets-post/doDeleteTimesheetRow.js';
import handler_doGetDeletedTimesheets from '../handlers/timesheets-post/doGetDeletedTimesheets.js';
import handler_doGetTimesheetCells from '../handlers/timesheets-post/doGetTimesheetCells.js';
import handler_doGetTimesheetColumns from '../handlers/timesheets-post/doGetTimesheetColumns.js';
import handler_doGetTimesheetRows from '../handlers/timesheets-post/doGetTimesheetRows.js';
import handler_doMarkEmployeesAsEntered from '../handlers/timesheets-post/doMarkEmployeesAsEntered.js';
import handler_doMarkEquipmentAsEntered from '../handlers/timesheets-post/doMarkEquipmentAsEntered.js';
import handler_doMarkTimesheetAsSubmitted from '../handlers/timesheets-post/doMarkTimesheetAsSubmitted.js';
import handler_doRecoverTimesheet from '../handlers/timesheets-post/doRecoverTimesheet.js';
import handler_doReorderTimesheetColumns from '../handlers/timesheets-post/doReorderTimesheetColumns.js';
import handler_doSearchTimesheets from '../handlers/timesheets-post/doSearchTimesheets.js';
import handler_doUpdateTimesheet from '../handlers/timesheets-post/doUpdateTimesheet.js';
import handler_doUpdateTimesheetCell from '../handlers/timesheets-post/doUpdateTimesheetCell.js';
import handler_doUpdateTimesheetColumn from '../handlers/timesheets-post/doUpdateTimesheetColumn.js';
import handler_doUpdateTimesheetRow from '../handlers/timesheets-post/doUpdateTimesheetRow.js';
function updateHandler(request, response, next) {
    if (request.session.user?.userProperties.timesheets.canUpdate ?? false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
function manageHandler(request, response, next) {
    if (request.session.user?.userProperties.timesheets.canManage ?? false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
export const router = Router();
router.get('/', handler_search).post('/doSearchTimesheets', handler_doSearchTimesheets);
router
    .get('/new', updateHandler, handler_new)
    .post('/doCreateTimesheet', updateHandler, handler_doCreateTimesheet);
router
    .get('/:timesheetId/edit', updateHandler, handler_edit)
    .post('/doUpdateTimesheet', updateHandler, handler_doUpdateTimesheet);
// Timesheet data endpoints
router.post('/doGetTimesheetColumns', handler_doGetTimesheetColumns);
router.post('/doGetTimesheetRows', handler_doGetTimesheetRows);
router.post('/doGetTimesheetCells', handler_doGetTimesheetCells);
router.post('/doAddTimesheetColumn', updateHandler, handler_doAddTimesheetColumn);
router.post('/doAddTimesheetRow', updateHandler, handler_doAddTimesheetRow);
router.post('/doUpdateTimesheetColumn', updateHandler, handler_doUpdateTimesheetColumn);
router.post('/doUpdateTimesheetRow', updateHandler, handler_doUpdateTimesheetRow);
router.post('/doUpdateTimesheetCell', updateHandler, handler_doUpdateTimesheetCell);
router.post('/doDeleteTimesheetColumn', updateHandler, handler_doDeleteTimesheetColumn);
router.post('/doDeleteTimesheetRow', updateHandler, handler_doDeleteTimesheetRow);
router.post('/doReorderTimesheetColumns', updateHandler, handler_doReorderTimesheetColumns);
router.post('/doCopyFromPreviousTimesheet', updateHandler, handler_doCopyFromPreviousTimesheet);
router.post('/doCopyFromShift', updateHandler, handler_doCopyFromShift);
router.post('/doMarkTimesheetAsSubmitted', updateHandler, handler_doMarkTimesheetAsSubmitted);
router.post('/doMarkEmployeesAsEntered', handler_doMarkEmployeesAsEntered);
router.post('/doMarkEquipmentAsEntered', handler_doMarkEquipmentAsEntered);
router
    .get('/recovery', manageHandler, handler_recovery)
    .post('/doGetDeletedTimesheets', manageHandler, handler_doGetDeletedTimesheets)
    .post('/doRecoverTimesheet', manageHandler, handler_doRecoverTimesheet);
router.get('/:timesheetId', handler_view);
export default router;
