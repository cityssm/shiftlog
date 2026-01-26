import type { Request, Response } from 'express';
import type { WorkOrderMilestone } from '../../types/record.types.js';
export type DoGetWorkOrderMilestonesResponse = {
    success: boolean;
    milestones: WorkOrderMilestone[];
};
export default function handler(request: Request<{
    workOrderId: string;
}>, response: Response<DoGetWorkOrderMilestonesResponse>): Promise<void>;
