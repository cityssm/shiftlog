import type { Request, Response } from 'express';
import type { GetTimesheetsFilters, GetTimesheetsOptions } from '../../database/timesheets/getTimesheets.js';
import type { Timesheet } from '../../types/record.types.js';
export type DoSearchTimesheetsResponse = {
    success: boolean;
    timesheets: Timesheet[];
    totalCount: number;
    limit: number;
    offset: number;
};
export default function handler(request: Request<unknown, unknown, GetTimesheetsFilters & GetTimesheetsOptions>, response: Response<DoSearchTimesheetsResponse>): Promise<void>;
