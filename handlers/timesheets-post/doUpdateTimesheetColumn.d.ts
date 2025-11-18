import type { Request, Response } from 'express';
import type { UpdateTimesheetColumnForm } from '../../database/timesheets/updateTimesheetColumn.js';
export default function handler(request: Request<unknown, unknown, UpdateTimesheetColumnForm>, response: Response): Promise<void>;
