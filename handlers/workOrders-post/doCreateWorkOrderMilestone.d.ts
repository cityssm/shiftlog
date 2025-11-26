import type { Request, Response } from 'express';
import { type CreateWorkOrderMilestoneForm } from '../../database/workOrders/createWorkOrderMilestone.js';
export default function handler(request: Request<unknown, unknown, CreateWorkOrderMilestoneForm>, response: Response): Promise<void>;
