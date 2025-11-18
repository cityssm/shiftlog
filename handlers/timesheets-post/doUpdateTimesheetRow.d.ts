import type { Request, Response } from 'express';
import type { UpdateTimesheetRowForm } from '../../database/timesheets/updateTimesheetRow.js';
export default function handler(request: Request<unknown, unknown, UpdateTimesheetRowForm>, response: Response): Promise<void>;
