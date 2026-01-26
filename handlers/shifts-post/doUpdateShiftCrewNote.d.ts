import type { Request, Response } from 'express';
export type DoUpdateShiftCrewNoteResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoUpdateShiftCrewNoteResponse>): Promise<void>;
