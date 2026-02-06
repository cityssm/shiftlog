import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoUpdateNoteTypeFieldResponse = {
    success: false;
    message: string;
} | {
    success: true;
    noteTypes: NoteTypeWithFields[];
};
export default function handler(request: Request<unknown, unknown, {
    noteTypeFieldId?: string | number;
    fieldLabel?: string;
    fieldInputType?: 'text' | 'number' | 'date' | 'select' | 'textbox';
    fieldHelpText?: string;
    dataListKey?: string;
    fieldValueMin?: string | number;
    fieldValueMax?: string | number;
    fieldValueRequired?: string | boolean;
    hasDividerAbove?: string | boolean;
}>, response: Response<DoUpdateNoteTypeFieldResponse>): Promise<void>;
