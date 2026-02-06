import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoDeleteNoteTypeFieldResponse = {
    success: false;
    message: string;
} | {
    success: true;
    noteTypes: NoteTypeWithFields[];
};
export default function handler(request: Request<unknown, unknown, {
    noteTypeFieldId?: string | number;
}>, response: Response<DoDeleteNoteTypeFieldResponse>): Promise<void>;
