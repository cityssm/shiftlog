import type { Request, Response } from 'express';
export type DoGetDeletedShiftsResponse = {
    success: boolean;
    shifts: Shift[];
};
export default function handler(request: Request, response: Response<DoGetDeletedShiftsResponse>): Promise<void>;
