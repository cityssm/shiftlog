import type { Request, Response } from 'express';
import type { CreateTimesheetForm } from '../../database/timesheets/createTimesheet.js';
export default function handler(request: Request<unknown, unknown, CreateTimesheetForm>, response: Response): Promise<void>;
