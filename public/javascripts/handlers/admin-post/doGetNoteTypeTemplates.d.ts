import type { Request, Response } from 'express';
import type { NoteTypeTemplate } from '../../types/noteTypeTemplates.types.js';
export interface DoGetNoteTypeTemplatesResponse {
    templates: NoteTypeTemplate[];
}
export default function handler(_request: Request, response: Response<DoGetNoteTypeTemplatesResponse>): void;
