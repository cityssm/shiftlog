import type { Request, Response } from 'express';
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js';
export type DoUpdateNoteTypeResponse = {
    message: string;
    success: false;
} | {
    message?: undefined;
    noteTypes: NoteTypeWithFields[];
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    isAvailableShifts?: boolean | string;
    isAvailableTimesheets?: boolean | string;
    isAvailableWorkOrders?: boolean | string;
    noteType?: string;
    noteTypeId?: number | string;
    userGroupId?: number | string;
}>, response: Response<DoUpdateNoteTypeResponse>): Promise<void>;
