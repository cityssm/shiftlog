import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderId: number | string;
}>, response: Response): Promise<void>;
