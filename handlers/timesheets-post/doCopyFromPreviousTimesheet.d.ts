import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    sourceTimesheetId: number | string;
    targetTimesheetId: number | string;
}>, response: Response): Promise<void>;
