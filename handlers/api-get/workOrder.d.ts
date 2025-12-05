import type { Request, Response } from 'express';
export default function handler(request: Request<{
    apiKey: string;
    workOrderId: string;
}, unknown, unknown>, response: Response): Promise<void>;
