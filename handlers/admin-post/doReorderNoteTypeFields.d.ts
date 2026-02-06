import type { Request, Response } from 'express';
import { type NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
import { type ReorderNoteTypeFieldsForm } from '../../database/noteTypes/reorderNoteTypeFields.js';
export type DoReorderNoteTypeFieldsResponse = {
    success: boolean;
    noteTypes?: NoteTypeWithFields[];
};
export default function handler(request: Request<unknown, unknown, ReorderNoteTypeFieldsForm>, response: Response<DoReorderNoteTypeFieldsResponse>): Promise<void>;
