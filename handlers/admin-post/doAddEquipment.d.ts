import type { Request, Response } from 'express';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
export type DoAddEquipmentResponse = {
    equipment: Awaited<ReturnType<typeof getEquipmentList>>;
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
