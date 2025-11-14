import type { Request, Response } from 'express';
import { type CreateShiftForm } from '../../database/shifts/createShift.js';
export default function handler(request: Request<unknown, unknown, CreateShiftForm>, response: Response): Promise<void>;
