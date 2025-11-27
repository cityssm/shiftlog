import type { Request, Response } from 'express';
import { type AddWorkOrderTypeForm } from '../../database/workOrderTypes/addWorkOrderType.js';
export default function handler(request: Request<unknown, unknown, AddWorkOrderTypeForm>, response: Response): Promise<void>;
