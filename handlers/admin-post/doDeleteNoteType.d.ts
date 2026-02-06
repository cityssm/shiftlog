import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoDeleteNoteTypeResponse = {
    message: string;
    success: false;
} | {
    noteTypes: NoteTypeWithFields[];
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    noteTypeId?: number | string;
}>, response: Response<DoDeleteNoteTypeResponse>): Promise<void>;
