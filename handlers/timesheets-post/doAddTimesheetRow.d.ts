import type { Request, Response } from 'express';
import type { AddTimesheetRowForm } from '../../database/timesheets/addTimesheetRow.js';
export default function handler(request: Request<unknown, unknown, AddTimesheetRowForm>, response: Response): Promise<void>;
