import type { Request, Response } from 'express';
export default function handler(request: Request<{
    apiKey: string;
    dataListKey: string;
}>, response: Response): Promise<void>;
