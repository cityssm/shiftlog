import type { Request, Response } from 'express';
import type { ReorderTimesheetColumnsForm } from '../../database/timesheets/reorderTimesheetColumns.js';
export default function handler(request: Request<unknown, unknown, ReorderTimesheetColumnsForm>, response: Response): Promise<void>;
