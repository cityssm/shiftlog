import type { Request, Response } from 'express';
import { type UpdateWorkOrderNoteForm } from '../../database/workOrders/updateWorkOrderNote.js';
export type DoUpdateWorkOrderNoteResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderNoteForm>, response: Response<DoUpdateWorkOrderNoteResponse>): Promise<void>;
