import type { Request, Response } from 'express';
import getShiftEquipment from '../../database/shifts/getShiftEquipment.js';
export type DoGetShiftEquipmentResponse = {
    success: boolean;
    shiftEquipment: Awaited<ReturnType<typeof getShiftEquipment>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftEquipmentResponse>): Promise<void>;
