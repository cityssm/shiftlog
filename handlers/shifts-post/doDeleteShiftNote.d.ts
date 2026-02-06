import type { Request, Response } from 'express';
export type DoDeleteShiftNoteResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    noteSequence: number | string;
}>, response: Response<DoDeleteShiftNoteResponse>): Promise<void>;
