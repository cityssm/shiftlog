import type { Request, Response } from 'express';
import { type CreateWorkOrderNoteForm } from '../../database/workOrders/createWorkOrderNote.js';
export default function handler(request: Request<unknown, unknown, CreateWorkOrderNoteForm>, response: Response): Promise<void>;
