import type { Request, Response } from 'express';
import { type CreateWorkOrderNoteForm } from '../../database/workOrders/createWorkOrderNote.js';
export type DoCreateWorkOrderNoteResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    noteSequence: number;
};
export default function handler(request: Request<unknown, unknown, CreateWorkOrderNoteForm>, response: Response<DoCreateWorkOrderNoteResponse>): Promise<void>;
