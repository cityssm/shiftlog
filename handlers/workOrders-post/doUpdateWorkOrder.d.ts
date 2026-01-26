import type { Request, Response } from 'express';
import { type UpdateWorkOrderForm } from '../../database/workOrders/updateWorkOrder.js';
export type DoUpdateWorkOrderResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderForm>, response: Response<DoUpdateWorkOrderResponse>): Promise<void>;
