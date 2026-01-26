import type { Request, Response } from 'express';
import getPreviousShifts from '../../database/shifts/getPreviousShifts.js';
export type DoGetPreviousShiftsResponse = {
    success: boolean;
    shifts: Awaited<ReturnType<typeof getPreviousShifts>>;
};
export default function handler(request: Request, response: Response<DoGetPreviousShiftsResponse>): Promise<void>;
