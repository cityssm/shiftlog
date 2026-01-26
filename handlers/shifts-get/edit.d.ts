import type { Request, Response } from 'express';
import type { ShiftEditResponse } from './types.js';
export default function handler(request: Request<{
    shiftId: string;
}, unknown, unknown, {
    error?: string;
}>, response: Response<ShiftEditResponse>): Promise<void>;
