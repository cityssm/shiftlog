import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoAddNoteTypeFromTemplateResponse = {
    message: string;
    success: false;
} | {
    noteTypes: NoteTypeWithFields[];
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    templateId?: string;
}>, response: Response<DoAddNoteTypeFromTemplateResponse>): Promise<void>;
