import type { Request, Response } from 'express';
import type { Shift } from '../../types/record.types.js';
export type DoGetDeletedShiftsResponse = {
    success: true;
    shifts: Shift[];
};
export default function handler(request: Request, response: Response<DoGetDeletedShiftsResponse>): Promise<void>;
