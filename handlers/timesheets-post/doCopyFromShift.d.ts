import type { Request, Response } from 'express';
export type DoCopyFromShiftResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    timesheetId: number | string;
}>, response: Response<DoCopyFromShiftResponse>): Promise<void>;
