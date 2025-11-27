import type { Request, Response } from 'express';
import { type UpdateWorkOrderTypeForm } from '../../database/workOrderTypes/updateWorkOrderType.js';
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderTypeForm>, response: Response): Promise<void>;
