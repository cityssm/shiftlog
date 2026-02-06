import type { Request, Response } from 'express';
import type { ShiftNote } from '../../database/shifts/getShiftNotes.js';
export type DoGetShiftNotesResponse = {
    success: true;
    notes: ShiftNote[];
};
export default function handler(request: Request<{
    shiftId: string;
}>, response: Response<DoGetShiftNotesResponse>): Promise<void>;
