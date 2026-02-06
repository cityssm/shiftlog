import type { Request, Response } from 'express';
import { type NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export interface DoGetNoteTypesResponse {
    noteTypes: NoteTypeWithFields[];
}
export default function handler(_request: Request, response: Response<DoGetNoteTypesResponse>): Promise<void>;
