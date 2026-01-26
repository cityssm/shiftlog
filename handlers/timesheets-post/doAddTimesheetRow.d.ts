import type { Request, Response } from 'express';
import type { AddTimesheetRowForm } from '../../database/timesheets/addTimesheetRow.js';
export type DoAddTimesheetRowResponse = {
    success: true;
    timesheetRowId: number;
};
export default function handler(request: Request<unknown, unknown, AddTimesheetRowForm>, response: Response<DoAddTimesheetRowResponse>): Promise<void>;
