import type { Request, Response } from 'express';
import type { UpdateTimesheetForm } from '../../database/timesheets/updateTimesheet.js';
export default function handler(request: Request<unknown, unknown, UpdateTimesheetForm>, response: Response): Promise<void>;
