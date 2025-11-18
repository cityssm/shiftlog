import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    timesheetColumnId: number | string;
}>, response: Response): Promise<void>;
