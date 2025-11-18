import type { Request, Response } from 'express';
export default function handler(request: Request<{
    timesheetId: string;
}, unknown, unknown, {
    error?: string;
}>, response: Response): Promise<void>;
