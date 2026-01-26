import type { Request, Response } from 'express';
import type { WorkOrder } from '../../types/record.types.js';
export type DoGetDeletedWorkOrdersResponse = {
    success: true;
    workOrders: WorkOrder[];
};
export default function handler(request: Request, response: Response<DoGetDeletedWorkOrdersResponse>): Promise<void>;
