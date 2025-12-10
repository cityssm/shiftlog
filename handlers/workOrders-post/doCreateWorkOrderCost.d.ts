import type { Request, Response } from 'express';
import { type CreateWorkOrderCostForm } from '../../database/workOrders/createWorkOrderCost.js';
export default function handler(request: Request<unknown, unknown, CreateWorkOrderCostForm>, response: Response): Promise<void>;
