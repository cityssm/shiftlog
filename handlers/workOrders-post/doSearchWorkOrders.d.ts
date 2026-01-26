import type { Request, Response } from 'express';
import { type GetWorkOrdersFilters, type GetWorkOrdersOptions } from '../../database/workOrders/getWorkOrders.js';
import type { WorkOrder } from '../../types/record.types.js';
export type DoSearchWorkOrdersResponse = {
    success: boolean;
    workOrders: WorkOrder[];
    totalCount: number;
    limit: number;
    offset: number;
};
export default function handler(request: Request<unknown, unknown, GetWorkOrdersFilters & GetWorkOrdersOptions>, response: Response<DoSearchWorkOrdersResponse>): Promise<void>;
