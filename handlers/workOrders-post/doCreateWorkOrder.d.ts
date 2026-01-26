import type { Request, Response } from 'express';
import { type CreateWorkOrderForm } from '../../database/workOrders/createWorkOrder.js';
export type DoCreateWorkOrderResponse = {
    success: true;
    workOrderId: number;
};
export default function handler(request: Request<unknown, unknown, CreateWorkOrderForm>, response: Response<DoCreateWorkOrderResponse>): Promise<void>;
