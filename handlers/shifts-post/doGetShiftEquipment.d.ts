import type { Request, Response } from 'express';
import type { ShiftEquipment } from '../../types/record.types.js';
export type DoGetShiftEquipmentResponse = {
    success: true;
    shiftEquipment: ShiftEquipment[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftEquipmentResponse>): Promise<void>;
