import type { Request, Response } from 'express';
import getDeletedShifts from '../../database/shifts/getDeletedShifts.js';
export type DoGetDeletedShiftsResponse = {
    success: boolean;
    shifts: Awaited<ReturnType<typeof getDeletedShifts>>;
};
export default function handler(request: Request, response: Response<DoGetDeletedShiftsResponse>): Promise<void>;
