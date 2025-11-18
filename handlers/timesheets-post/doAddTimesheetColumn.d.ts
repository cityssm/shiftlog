import type { Request, Response } from 'express';
import type { AddTimesheetColumnForm } from '../../database/timesheets/addTimesheetColumn.js';
export default function handler(request: Request<unknown, unknown, AddTimesheetColumnForm>, response: Response): Promise<void>;
