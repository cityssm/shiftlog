import type { Request, Response } from 'express';
import type { CreateTimesheetForm } from '../../database/timesheets/createTimesheet.js';
export type DoCreateTimesheetResponse = {
    success: true;
    timesheetId: number;
    redirectURL: string;
};
export default function handler(request: Request<unknown, unknown, CreateTimesheetForm>, response: Response<DoCreateTimesheetResponse>): Promise<void>;
