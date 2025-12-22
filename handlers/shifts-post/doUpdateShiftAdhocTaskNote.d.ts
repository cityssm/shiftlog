import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    adhocTaskId: number | string;
    shiftAdhocTaskNote: string;
}>, response: Response): Promise<void>;
