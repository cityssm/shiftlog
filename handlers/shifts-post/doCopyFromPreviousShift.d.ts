import type { Request, Response } from 'express';
export type DoCopyFromPreviousShiftResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoCopyFromPreviousShiftResponse>): Promise<void>;
