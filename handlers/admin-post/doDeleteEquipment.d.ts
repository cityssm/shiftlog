import type { Request, Response } from 'express';
import type { Equipment } from '../../types/record.types.js';
export type DoDeleteEquipmentResponse = {
    equipment: Equipment[];
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    equipmentNumber: string;
}>, response: Response<DoDeleteEquipmentResponse>): Promise<void>;
