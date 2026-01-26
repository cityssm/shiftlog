import type { Request, Response } from 'express';
export type DoUpdateShiftEquipmentNoteResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoUpdateShiftEquipmentNoteResponse>): Promise<void>;
