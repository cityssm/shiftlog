import type { Request, Response } from 'express';
import { type CreateWorkOrderMilestoneForm } from '../../database/workOrders/createWorkOrderMilestone.js';
export type DoCreateWorkOrderMilestoneResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    workOrderMilestoneId: number;
};
export default function handler(request: Request<unknown, unknown, CreateWorkOrderMilestoneForm>, response: Response<DoCreateWorkOrderMilestoneResponse>): Promise<void>;
