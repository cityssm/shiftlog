import { Router } from 'express';
import handler_reportKey from '../handlers/api-get/reportKey.js';
import handler_workOrder from '../handlers/api-get/workOrder.js';
import { apiGetHandler } from '../handlers/permissions.js';
export const router = Router();
router.get('/:apiKey/reports/:reportKey', apiGetHandler, handler_reportKey);
router.get('/:apiKey/workOrders/:workOrderId.ics', apiGetHandler, handler_workOrder);
export default router;
