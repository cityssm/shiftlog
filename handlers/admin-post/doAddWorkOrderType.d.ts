import type { Request, Response } from 'express';
import { type AddWorkOrderTypeForm } from '../../database/workOrderTypes/addWorkOrderType.js';
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js';
export type DoAddWorkOrderTypeResponse = {
    success: true;
    workOrderTypes: Awaited<ReturnType<typeof getWorkOrderTypesAdmin>>;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, AddWorkOrderTypeForm>, response: Response<DoAddWorkOrderTypeResponse>): Promise<void>;
