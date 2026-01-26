import type { Request, Response } from 'express';
export type DoGetShiftTimesheetsResponse = {
    success: boolean;
    timesheets: Timesheet[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftTimesheetsResponse>): Promise<void>;
