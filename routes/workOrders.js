import os from 'node:os';
import { Router } from 'express';
import multer from 'multer';
import handler_calendar from '../handlers/workOrders-get/calendar.js';
import handler_download from '../handlers/workOrders-get/download.js';
import handler_edit from '../handlers/workOrders-get/edit.js';
import handler_inline from '../handlers/workOrders-get/inline.js';
import handler_map from '../handlers/workOrders-get/map.js';
import handler_new from '../handlers/workOrders-get/new.js';
import handler_planner from '../handlers/workOrders-get/planner.js';
import handler_print from '../handlers/workOrders-get/print.js';
import handler_recovery from '../handlers/workOrders-get/recovery.js';
import handler_search from '../handlers/workOrders-get/search.js';
import handler_view from '../handlers/workOrders-get/view.js';
import handler_doAddWorkOrderTag from '../handlers/workOrders-post/doAddWorkOrderTag.js';
import handler_doCreateWorkOrder from '../handlers/workOrders-post/doCreateWorkOrder.js';
import handler_doCreateWorkOrderMilestone from '../handlers/workOrders-post/doCreateWorkOrderMilestone.js';
import handler_doCreateWorkOrderNote from '../handlers/workOrders-post/doCreateWorkOrderNote.js';
import handler_doDeleteWorkOrder from '../handlers/workOrders-post/doDeleteWorkOrder.js';
import handler_doDeleteWorkOrderAttachment from '../handlers/workOrders-post/doDeleteWorkOrderAttachment.js';
import handler_doDeleteWorkOrderMilestone from '../handlers/workOrders-post/doDeleteWorkOrderMilestone.js';
import handler_doDeleteWorkOrderNote from '../handlers/workOrders-post/doDeleteWorkOrderNote.js';
import handler_doDeleteWorkOrderTag from '../handlers/workOrders-post/doDeleteWorkOrderTag.js';
import handler_doGetCalendarEvents from '../handlers/workOrders-post/doGetCalendarEvents.js';
import handler_doGetDeletedWorkOrders from '../handlers/workOrders-post/doGetDeletedWorkOrders.js';
import handler_doGetLocationSuggestions from '../handlers/workOrders-post/doGetLocationSuggestions.js';
import handler_doGetRequestorSuggestions from '../handlers/workOrders-post/doGetRequestorSuggestions.js';
import handler_doGetWorkOrderAttachments from '../handlers/workOrders-post/doGetWorkOrderAttachments.js';
import handler_doGetWorkOrderMilestones from '../handlers/workOrders-post/doGetWorkOrderMilestones.js';
import handler_doGetWorkOrderNotes from '../handlers/workOrders-post/doGetWorkOrderNotes.js';
import handler_doGetWorkOrdersForPlanner from '../handlers/workOrders-post/doGetWorkOrdersForPlanner.js';
import handler_doGetWorkOrderTags from '../handlers/workOrders-post/doGetWorkOrderTags.js';
import handler_doRecoverWorkOrder from '../handlers/workOrders-post/doRecoverWorkOrder.js';
import handler_doReopenWorkOrder from '../handlers/workOrders-post/doReopenWorkOrder.js';
import handler_doSearchWorkOrders from '../handlers/workOrders-post/doSearchWorkOrders.js';
import handler_doUpdateWorkOrder from '../handlers/workOrders-post/doUpdateWorkOrder.js';
import handler_doUpdateWorkOrderMilestone from '../handlers/workOrders-post/doUpdateWorkOrderMilestone.js';
import handler_doUpdateWorkOrderMilestoneOrder from '../handlers/workOrders-post/doUpdateWorkOrderMilestoneOrder.js';
import handler_doUpdateWorkOrderNote from '../handlers/workOrders-post/doUpdateWorkOrderNote.js';
import handler_doUploadWorkOrderAttachment from '../handlers/workOrders-post/doUploadWorkOrderAttachment.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
const upload = multer({
    dest: os.tmpdir(),
    limits: {
        fileSize: getConfigProperty('application.attachmentMaximumFileSizeBytes')
    }
});
function updateHandler(request, response, next) {
    if (request.session.user?.userProperties.workOrders.canUpdate ?? false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
function manageHandler(request, response, next) {
    if (request.session.user?.userProperties.workOrders.canManage ?? false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
export const router = Router();
router
    .get('/', handler_search)
    .get('/calendar', handler_calendar)
    .get('/map', handler_map)
    .get('/planner', handler_planner)
    .post('/doSearchWorkOrders', handler_doSearchWorkOrders)
    .post('/doGetCalendarEvents', handler_doGetCalendarEvents)
    .post('/doGetWorkOrdersForPlanner', handler_doGetWorkOrdersForPlanner);
router
    .post('/doGetRequestorSuggestions', handler_doGetRequestorSuggestions)
    .post('/doGetLocationSuggestions', handler_doGetLocationSuggestions);
router
    .get('/new', updateHandler, handler_new)
    .post('/doCreateWorkOrder', updateHandler, handler_doCreateWorkOrder);
router
    .get('/:workOrderId/edit', updateHandler, handler_edit)
    .post('/doUpdateWorkOrder', updateHandler, handler_doUpdateWorkOrder)
    .post('/doDeleteWorkOrder', updateHandler, handler_doDeleteWorkOrder)
    .post('/doReopenWorkOrder', updateHandler, handler_doReopenWorkOrder);
router
    .post('/:workOrderId/doGetWorkOrderNotes', handler_doGetWorkOrderNotes)
    .post('/doCreateWorkOrderNote', updateHandler, handler_doCreateWorkOrderNote)
    .post('/doUpdateWorkOrderNote', updateHandler, handler_doUpdateWorkOrderNote)
    .post('/doDeleteWorkOrderNote', updateHandler, handler_doDeleteWorkOrderNote);
router
    .post('/:workOrderId/doGetWorkOrderMilestones', handler_doGetWorkOrderMilestones)
    .post('/doCreateWorkOrderMilestone', updateHandler, handler_doCreateWorkOrderMilestone)
    .post('/doUpdateWorkOrderMilestone', updateHandler, handler_doUpdateWorkOrderMilestone)
    .post('/doDeleteWorkOrderMilestone', updateHandler, handler_doDeleteWorkOrderMilestone)
    .post('/doUpdateWorkOrderMilestoneOrder', updateHandler, handler_doUpdateWorkOrderMilestoneOrder);
router
    .post('/:workOrderId/doGetWorkOrderAttachments', handler_doGetWorkOrderAttachments)
    .post('/doUploadWorkOrderAttachment', updateHandler, upload.single('attachmentFile'), handler_doUploadWorkOrderAttachment)
    .post('/doDeleteWorkOrderAttachment', updateHandler, handler_doDeleteWorkOrderAttachment);
router
    .post('/:workOrderId/doGetWorkOrderTags', handler_doGetWorkOrderTags)
    .post('/doAddWorkOrderTag', updateHandler, handler_doAddWorkOrderTag)
    .post('/doDeleteWorkOrderTag', updateHandler, handler_doDeleteWorkOrderTag);
router.get('/attachments/:workOrderAttachmentId/download', handler_download);
router.get('/attachments/:workOrderAttachmentId/inline', handler_inline);
router
    .get('/recovery', manageHandler, handler_recovery)
    .post('/doGetDeletedWorkOrders', manageHandler, handler_doGetDeletedWorkOrders)
    .post('/doRecoverWorkOrder', manageHandler, handler_doRecoverWorkOrder);
router.get('/:workOrderId/print', handler_print);
router.get('/:workOrderId', handler_view);
export default router;
