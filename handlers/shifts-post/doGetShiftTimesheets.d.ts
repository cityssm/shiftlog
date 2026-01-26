import type { Request, Response } from 'express';
import getTimesheetsByShift from '../../database/timesheets/getTimesheetsByShift.js';
export type DoGetShiftTimesheetsResponse = {
    success: boolean;
    timesheets: Awaited<ReturnType<typeof getTimesheetsByShift>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftTimesheetsResponse>): Promise<void>;
