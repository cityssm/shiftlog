import type { Request, Response } from 'express';
import { type UpdateWorkOrderCostForm } from '../../database/workOrders/updateWorkOrderCost.js';
export type DoUpdateWorkOrderCostResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderCostForm>, response: Response<DoUpdateWorkOrderCostResponse>): Promise<void>;
