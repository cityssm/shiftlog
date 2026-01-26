import type { Request, Response } from 'express';
import type { WorkOrderCost } from '../../types/record.types.js';
export type DoGetWorkOrderCostsResponse = {
    success: boolean;
    costs: WorkOrderCost[];
};
export default function handler(request: Request<{
    workOrderId: string;
}>, response: Response<DoGetWorkOrderCostsResponse>): Promise<void>;
