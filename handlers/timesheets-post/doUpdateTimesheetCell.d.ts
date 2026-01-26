import type { Request, Response } from 'express';
import type { UpdateTimesheetCellForm } from '../../database/timesheets/updateTimesheetCell.js';
export type DoUpdateTimesheetCellResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateTimesheetCellForm>, response: Response<DoUpdateTimesheetCellResponse>): Promise<void>;
