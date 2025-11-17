import type { Request, Response } from 'express';
import { type UpdateShiftForm } from '../../database/shifts/updateShift.js';
export default function handler(request: Request<unknown, unknown, UpdateShiftForm>, response: Response): Promise<void>;
