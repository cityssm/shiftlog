import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoAddNoteTypeResponse = {
    message: string;
    success: false;
} | {
    noteTypes: NoteTypeWithFields[];
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    isAvailableShifts?: boolean | string;
    isAvailableTimesheets?: boolean | string;
    isAvailableWorkOrders?: boolean | string;
    noteType?: string;
    userGroupId?: number | string;
}>, response: Response<DoAddNoteTypeResponse>): Promise<void>;
