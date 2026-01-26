import type { Request, Response } from 'express';
import type { UpdateTimesheetForm } from '../../database/timesheets/updateTimesheet.js';
export type DoUpdateTimesheetResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateTimesheetForm>, response: Response<DoUpdateTimesheetResponse>): Promise<void>;
