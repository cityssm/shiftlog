import type { Request, Response } from 'express';
export type DoGetPreviousShiftsResponse = {
    success: boolean;
    shifts: Shift[];
};
export default function handler(request: Request, response: Response<DoGetPreviousShiftsResponse>): Promise<void>;
