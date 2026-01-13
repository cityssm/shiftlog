import type { Request, Response } from 'express';
export default function handler(request: Request<{
    apiKey: string;
}, unknown, unknown, {
    assignedToId?: string;
}>, response: Response): Promise<void>;
