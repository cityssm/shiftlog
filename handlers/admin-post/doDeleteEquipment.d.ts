import type { Request, Response } from 'express';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
export type DoDeleteEquipmentResponse = {
    equipment: Awaited<ReturnType<typeof getEquipmentList>>;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    equipmentNumber: string;
}>, response: Response<DoDeleteEquipmentResponse>): Promise<void>;
