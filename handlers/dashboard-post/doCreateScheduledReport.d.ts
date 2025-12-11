import type { Request, Response } from 'express';
import { type CreateScheduledReportForm } from '../../database/users/createUserScheduledReport.js';
export default function handler(request: Request<unknown, unknown, CreateScheduledReportForm>, response: Response): Promise<void>;
