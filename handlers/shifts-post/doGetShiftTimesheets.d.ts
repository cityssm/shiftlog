import type { Request, Response } from 'express';
import type { Timesheet } from '../../types/record.types.js';
export type DoGetShiftTimesheetsResponse = {
    success: true;
    timesheets: Timesheet[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftTimesheetsResponse>): Promise<void>;
