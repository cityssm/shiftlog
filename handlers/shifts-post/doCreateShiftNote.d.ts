import type { Request, Response } from 'express';
import { type CreateShiftNoteForm } from '../../database/shifts/createShiftNote.js';
export type DoCreateShiftNoteResponse = {
    errorMessage: string;
    success: false;
} | {
    noteSequence: number;
    success: true;
};
export default function handler(request: Request<unknown, unknown, CreateShiftNoteForm>, response: Response<DoCreateShiftNoteResponse>): Promise<void>;
