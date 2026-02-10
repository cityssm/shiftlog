import type { Request, Response } from 'express';
import { type UpdateWorkOrderTypeForm } from '../../database/workOrderTypes/updateWorkOrderType.js';
import type { WorkOrderType } from '../../types/record.types.js';
export type DoUpdateWorkOrderTypeResponse = {
    message: string;
    success: false;
} | {
    success: true;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderTypeForm>, response: Response<DoUpdateWorkOrderTypeResponse>): Promise<void>;
