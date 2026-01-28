import type { Request, Response } from 'express';
export type DoUpdateShiftAdhocTaskNoteResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    adhocTaskId: number | string;
    shiftAdhocTaskNote: string;
}>, response: Response<DoUpdateShiftAdhocTaskNoteResponse>): Promise<void>;
