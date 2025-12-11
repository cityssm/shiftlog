import type { Request, Response } from 'express';
import { type UpdateScheduledReportForm } from '../../database/users/updateUserScheduledReport.js';
export default function handler(request: Request<unknown, unknown, UpdateScheduledReportForm>, response: Response): Promise<void>;
