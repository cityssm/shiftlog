import type { Request, Response } from 'express';
import { type UpdateWorkOrderCostForm } from '../../database/workOrders/updateWorkOrderCost.js';
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderCostForm>, response: Response): Promise<void>;
