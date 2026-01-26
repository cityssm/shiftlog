import type { Request, Response } from 'express';
import type { TimesheetColumn } from '../../types/record.types.js';
export type DoGetTimesheetColumnsResponse = {
    columns: TimesheetColumn[];
};
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
}>, response: Response<DoGetTimesheetColumnsResponse>): Promise<void>;
