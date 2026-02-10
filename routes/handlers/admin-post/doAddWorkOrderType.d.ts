import type { Request, Response } from 'express';
import { type AddWorkOrderTypeForm } from '../../database/workOrderTypes/addWorkOrderType.js';
import type { WorkOrderType } from '../../types/record.types.js';
export type DoAddWorkOrderTypeResponse = {
    message: string;
    success: false;
} | {
    success: true;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, AddWorkOrderTypeForm>, response: Response<DoAddWorkOrderTypeResponse>): Promise<void>;
