import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderMilestoneId: number | string;
}>, response: Response): Promise<void>;
