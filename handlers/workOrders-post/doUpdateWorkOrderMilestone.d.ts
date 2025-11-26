import type { Request, Response } from 'express';
import { type UpdateWorkOrderMilestoneForm } from '../../database/workOrders/updateWorkOrderMilestone.js';
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderMilestoneForm>, response: Response): Promise<void>;
