import type { Request, Response } from 'express';
import type { ReportParameters } from '../../database/reports/types.js';
export default function handler(request: Request<{
    apiKey: string;
    reportKey: string;
}, unknown, unknown, ReportParameters>, response: Response): Promise<void>;
