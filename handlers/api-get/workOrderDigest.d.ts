import type { Request, Response } from 'express';
export default function handler(request: Request<{
    apiKey: string;
}, unknown, unknown, {
    assignedToDataListItemId?: string;
}>, response: Response): Promise<void>;
