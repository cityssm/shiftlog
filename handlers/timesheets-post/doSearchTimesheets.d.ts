import type { Request, Response } from 'express';
import type { GetTimesheetsFilters, GetTimesheetsOptions } from '../../database/timesheets/getTimesheets.js';
export default function handler(request: Request<unknown, unknown, GetTimesheetsFilters & GetTimesheetsOptions>, response: Response): Promise<void>;
