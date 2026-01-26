import type { Request, Response } from 'express';
import type { UpdateTimesheetRowForm } from '../../database/timesheets/updateTimesheetRow.js';
export type DoUpdateTimesheetRowResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateTimesheetRowForm>, response: Response<DoUpdateTimesheetRowResponse>): Promise<void>;
