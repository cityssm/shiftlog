import type { Request, Response } from 'express';
export type DoUpdateShiftEmployeeNoteResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoUpdateShiftEmployeeNoteResponse>): Promise<void>;
