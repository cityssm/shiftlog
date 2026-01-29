import type { Request, Response } from 'express';
import { type UpdateWorkOrderAttachmentForm } from '../../database/workOrders/updateWorkOrderAttachment.js';
export type DoUpdateWorkOrderAttachmentResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderAttachmentForm>, response: Response<DoUpdateWorkOrderAttachmentResponse>): Promise<void>;
