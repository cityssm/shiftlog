import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoDeleteNoteTypeResponse = {
    success: false;
    message: string;
} | {
    success: true;
    noteTypes: NoteTypeWithFields[];
};
export default function handler(request: Request<unknown, unknown, {
    noteTypeId?: string | number;
}>, response: Response<DoDeleteNoteTypeResponse>): Promise<void>;
