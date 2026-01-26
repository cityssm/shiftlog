import type { Request, Response } from 'express';
import type { WorkOrderTag } from '../../types/record.types.js';
export type DoGetWorkOrderTagsResponse = {
    success: boolean;
    tags: WorkOrderTag[];
};
export default function handler(request: Request<{
    workOrderId: string;
}>, response: Response<DoGetWorkOrderTagsResponse>): Promise<void>;
