import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoUpdateNoteTypeResponse = {
    success: false;
    message: string;
} | {
    success: true;
    noteTypes: NoteTypeWithFields[];
};
export default function handler(request: Request<unknown, unknown, {
    noteTypeId?: string | number;
    noteType?: string;
    userGroupId?: string | number;
    isAvailableWorkOrders?: string | boolean;
    isAvailableShifts?: string | boolean;
    isAvailableTimesheets?: string | boolean;
}>, response: Response<DoUpdateNoteTypeResponse>): Promise<void>;
