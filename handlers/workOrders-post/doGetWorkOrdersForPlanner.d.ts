import type { Request, Response } from 'express';
import { type GetWorkOrdersForPlannerFilters, type GetWorkOrdersForPlannerOptions } from '../../database/workOrders/getWorkOrdersForPlanner.js';
import type { WorkOrder } from '../../types/record.types.js';
export interface DoGetWorkOrdersForPlannerResponse {
    success: boolean;
    workOrders: WorkOrder[];
    totalCount: number;
    limit: number;
    offset: number;
}
export default function handler(request: Request<unknown, unknown, GetWorkOrdersForPlannerFilters & GetWorkOrdersForPlannerOptions>, response: Response<DoGetWorkOrdersForPlannerResponse>): Promise<void>;
