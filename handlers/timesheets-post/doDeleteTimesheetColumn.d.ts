import type { Request, Response } from 'express';
import { type DeleteTimesheetColumnResult } from '../../database/timesheets/deleteTimesheetColumn.js';
export type DoDeleteTimesheetColumnResponse = DeleteTimesheetColumnResult;
export default function handler(request: Request<unknown, unknown, {
    timesheetColumnId: number | string;
}>, response: Response<DoDeleteTimesheetColumnResponse>): Promise<void>;
