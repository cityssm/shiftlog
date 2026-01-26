import type { Request, Response } from 'express';
import type { ReorderTimesheetColumnsForm } from '../../database/timesheets/reorderTimesheetColumns.js';
export type DoReorderTimesheetColumnsResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, ReorderTimesheetColumnsForm>, response: Response<DoReorderTimesheetColumnsResponse>): Promise<void>;
