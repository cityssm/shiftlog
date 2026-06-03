import { Router } from 'express';
import handler_download from '../handlers/attachments-get/download.js';
import handler_inline from '../handlers/attachments-get/inline.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
export const router = Router();
router
    .get(`/${getConfigProperty('workOrders.router')}/:workOrderAttachmentId/:accessKey/download`, handler_download)
    .get(`/${getConfigProperty('workOrders.router')}/:workOrderAttachmentId/:accessKey/inline`, handler_inline);
export default router;
