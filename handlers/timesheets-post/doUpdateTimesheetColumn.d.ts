import type { Request, Response } from 'express';
import type { UpdateTimesheetColumnForm } from '../../database/timesheets/updateTimesheetColumn.js';
export type DoUpdateTimesheetColumnResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateTimesheetColumnForm>, response: Response<DoUpdateTimesheetColumnResponse>): Promise<void>;
