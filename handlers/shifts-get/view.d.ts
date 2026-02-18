import type { Request, Response } from 'express';
export default function handler(request: Request<{
    shiftId: string;
}, unknown, unknown, {
    error?: string;
}>, response: Response): Promise<void>;
