import type { Request, Response } from 'express';
import { type UpdateShiftEquipmentNoteForm } from '../../database/shifts/updateShiftEquipmentNote.js';
export type DoUpdateShiftEquipmentNoteResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateShiftEquipmentNoteForm>, response: Response<DoUpdateShiftEquipmentNoteResponse>): Promise<void>;
