import type { Request, Response } from 'express';
import type { UpdateTimesheetCellForm } from '../../database/timesheets/updateTimesheetCell.js';
export default function handler(request: Request<unknown, unknown, UpdateTimesheetCellForm>, response: Response): Promise<void>;
