import type { Request, Response } from 'express';
import type { Equipment } from '../../types/record.types.js';
export type DoUpdateEquipmentResponse = {
    equipment: Equipment[];
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    equipmentDescription: string;
    equipmentName: string;
    equipmentNumber: string;
    equipmentTypeDataListItemId: string;
    employeeListId: string;
    userGroupId: string;
    recordSync_isSynced?: string;
}>, response: Response<DoUpdateEquipmentResponse>): Promise<void>;
