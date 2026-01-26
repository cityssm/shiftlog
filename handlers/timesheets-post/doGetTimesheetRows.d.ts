import type { Request, Response } from 'express';
import type { GetTimesheetRowsFilters } from '../../database/timesheets/getTimesheetRows.js';
import type { TimesheetRow } from '../../types/record.types.js';
export type DoGetTimesheetRowsResponse = {
    rows: TimesheetRow[];
};
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
} & GetTimesheetRowsFilters>, response: Response<DoGetTimesheetRowsResponse>): Promise<void>;
