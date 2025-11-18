import type { Request, Response } from 'express';
import type { GetTimesheetRowsFilters } from '../../database/timesheets/getTimesheetRows.js';
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
} & GetTimesheetRowsFilters>, response: Response): Promise<void>;
