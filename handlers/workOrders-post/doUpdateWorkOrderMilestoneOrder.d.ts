import type { Request, Response } from 'express';
import { type MilestoneOrderUpdate } from '../../database/workOrders/updateWorkOrderMilestoneOrder.js';
export default function handler(request: Request<unknown, unknown, {
    milestoneOrders: MilestoneOrderUpdate[];
}>, response: Response): Promise<void>;
