import type { Request, Response } from 'express';
import { type CreateWorkOrderCostForm } from '../../database/workOrders/createWorkOrderCost.js';
export type DoCreateWorkOrderCostResponse = {
    success: true;
    workOrderCostId: number;
};
export default function handler(request: Request<unknown, unknown, CreateWorkOrderCostForm>, response: Response<DoCreateWorkOrderCostResponse>): Promise<void>;
