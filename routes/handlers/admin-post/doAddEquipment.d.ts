import type { Request, Response } from 'express';
import type { Equipment } from '../../types/record.types.js';
export type DoAddEquipmentResponse = {
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
}>, response: Response<DoAddEquipmentResponse>): Promise<void>;
