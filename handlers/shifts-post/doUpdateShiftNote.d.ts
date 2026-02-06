import type { Request, Response } from 'express';
import { type UpdateShiftNoteForm } from '../../database/shifts/updateShiftNote.js';
export type DoUpdateShiftNoteResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateShiftNoteForm>, response: Response<DoUpdateShiftNoteResponse>): Promise<void>;
