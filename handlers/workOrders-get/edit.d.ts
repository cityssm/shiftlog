import type { Request, Response } from 'express';
export default function handler(request: Request<{
    workOrderId: string;
}, unknown, unknown, {
    error?: string;
}>, response: Response): Promise<void>;
