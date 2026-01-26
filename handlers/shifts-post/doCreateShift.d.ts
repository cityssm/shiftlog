import type { Request, Response } from 'express';
import { type CreateShiftForm } from '../../database/shifts/createShift.js';
export type DoCreateShiftResponse = {
    success: boolean;
    shiftId: number;
};
export default function handler(request: Request<unknown, unknown, CreateShiftForm>, response: Response<DoCreateShiftResponse>): Promise<void>;
