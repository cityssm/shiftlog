import type { Request, Response } from 'express';
import type { NoteTypeTemplate } from '../../types/application.types.js';
export type DoGetNoteTypeTemplatesResponse = {
    templates: NoteTypeTemplate[];
};
export default function handler(_request: Request, response: Response<DoGetNoteTypeTemplatesResponse>): void;
