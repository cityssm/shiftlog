import { Router } from 'express';
import handler_edit from '../handlers/workOrders-get/edit.js';
import handler_new from '../handlers/workOrders-get/new.js';
import handler_search from '../handlers/workOrders-get/search.js';
import handler_view from '../handlers/workOrders-get/view.js';
import handler_doCreateWorkOrder from '../handlers/workOrders-post/doCreateWorkOrder.js';
import handler_doSearchWorkOrders from '../handlers/workOrders-post/doSearchWorkOrders.js';
import handler_doUpdateWorkOrder from '../handlers/workOrders-post/doUpdateWorkOrder.js';
function updateHandler(request, response, next) {
    if (request.session.user?.userProperties.workOrders.canUpdate ?? false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
export const router = Router();
router.get('/', handler_search).post('/doSearchWorkOrders', handler_doSearchWorkOrders);
router
    .get('/new', updateHandler, handler_new)
    .post('/doCreateWorkOrder', updateHandler, handler_doCreateWorkOrder);
router
    .get('/:workOrderId/edit', updateHandler, handler_edit)
    .post('/doUpdateWorkOrder', updateHandler, handler_doUpdateWorkOrder);
router.get('/:workOrderId', handler_view);
export default router;
