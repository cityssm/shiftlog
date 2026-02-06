import type { Request, Response } from 'express';
import { type CreateShiftNoteForm } from '../../database/shifts/createShiftNote.js';
export type DoCreateShiftNoteResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    noteSequence: number;
};
export default function handler(request: Request<unknown, unknown, CreateShiftNoteForm>, response: Response<DoCreateShiftNoteResponse>): Promise<void>;
