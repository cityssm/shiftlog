import type { Request, Response } from 'express';
import type { WorkOrderAttachment } from '../../types/record.types.js';
export type DoGetWorkOrderAttachmentsResponse = {
    success: true;
    attachments: WorkOrderAttachment[];
};
export default function handler(request: Request<{
    workOrderId: string;
}>, response: Response<DoGetWorkOrderAttachmentsResponse>): Promise<void>;
