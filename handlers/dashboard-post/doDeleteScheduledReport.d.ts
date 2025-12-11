import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    scheduledReportId: number | string;
}>, response: Response): Promise<void>;
