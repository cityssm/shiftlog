import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    workOrderId: number | string;
}>, response: Response): Promise<void>;
