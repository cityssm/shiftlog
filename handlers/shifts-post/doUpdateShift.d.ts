import type { Request, Response } from 'express';
import { type UpdateShiftForm } from '../../database/shifts/updateShift.js';
export type DoUpdateShiftResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateShiftForm>, response: Response<DoUpdateShiftResponse>): Promise<void>;
