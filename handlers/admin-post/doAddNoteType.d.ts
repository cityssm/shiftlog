import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoAddNoteTypeResponse = {
    success: false;
    message: string;
} | {
    success: true;
    noteTypes: NoteTypeWithFields[];
};
export default function handler(request: Request<unknown, unknown, {
    noteType?: string;
    userGroupId?: string | number;
    isAvailableWorkOrders?: string | boolean;
    isAvailableShifts?: string | boolean;
    isAvailableTimesheets?: string | boolean;
}>, response: Response<DoAddNoteTypeResponse>): Promise<void>;
