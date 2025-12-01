import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    limit: number | string;
    offset: number | string;
}>, response: Response): Promise<void>;
