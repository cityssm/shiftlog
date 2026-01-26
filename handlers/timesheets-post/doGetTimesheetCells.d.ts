import type { Request, Response } from 'express';
import type { TimesheetCell } from '../../types/record.types.js';
export type DoGetTimesheetCellsResponse = {
    cells: TimesheetCell[];
};
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
}>, response: Response<DoGetTimesheetCellsResponse>): Promise<void>;
