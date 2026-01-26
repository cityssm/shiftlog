import type { Request, Response } from 'express';
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js';
import { type UpdateWorkOrderTypeForm } from '../../database/workOrderTypes/updateWorkOrderType.js';
export type DoUpdateWorkOrderTypeResponse = {
    success: true;
    workOrderTypes: Awaited<ReturnType<typeof getWorkOrderTypesAdmin>>;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderTypeForm>, response: Response<DoUpdateWorkOrderTypeResponse>): Promise<void>;
