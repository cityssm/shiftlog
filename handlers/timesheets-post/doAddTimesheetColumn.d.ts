import type { Request, Response } from 'express';
import type { AddTimesheetColumnForm } from '../../database/timesheets/addTimesheetColumn.js';
export type DoAddTimesheetColumnResponse = {
    success: boolean;
    timesheetColumnId: number;
};
export default function handler(request: Request<unknown, unknown, AddTimesheetColumnForm>, response: Response<DoAddTimesheetColumnResponse>): Promise<void>;
