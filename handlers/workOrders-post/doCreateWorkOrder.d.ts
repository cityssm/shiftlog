import type { Request, Response } from 'express';
import { type CreateWorkOrderForm } from '../../database/workOrders/createWorkOrder.js';
export default function handler(request: Request<unknown, unknown, CreateWorkOrderForm>, response: Response): Promise<void>;
