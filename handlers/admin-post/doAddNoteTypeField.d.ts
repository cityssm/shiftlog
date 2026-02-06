import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoAddNoteTypeFieldResponse = {
    message: string;
    success: false;
} | {
    noteTypes: NoteTypeWithFields[];
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    dataListKey?: string;
    fieldHelpText?: string;
    fieldInputType?: 'date' | 'number' | 'select' | 'text' | 'textbox';
    fieldLabel?: string;
    fieldValueMax?: number | string;
    fieldValueMin?: number | string;
    fieldValueRequired?: boolean | string;
    hasDividerAbove?: boolean | string;
    noteTypeId?: number | string;
}>, response: Response<DoAddNoteTypeFieldResponse>): Promise<void>;
