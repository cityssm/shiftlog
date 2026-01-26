import type { Request, Response } from 'express';
import { type UpdateWorkOrderMilestoneForm } from '../../database/workOrders/updateWorkOrderMilestone.js';
export type DoUpdateWorkOrderMilestoneResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderMilestoneForm>, response: Response<DoUpdateWorkOrderMilestoneResponse>): Promise<void>;
