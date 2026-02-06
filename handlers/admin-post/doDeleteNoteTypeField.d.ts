import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoDeleteNoteTypeFieldResponse = {
    message: string;
    success: false;
} | {
    message?: undefined;
    noteTypes: NoteTypeWithFields[];
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    noteTypeFieldId?: number | string;
}>, response: Response<DoDeleteNoteTypeFieldResponse>): Promise<void>;
