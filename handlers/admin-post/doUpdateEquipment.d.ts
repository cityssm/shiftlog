import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    equipmentNumber: string;
    equipmentName: string;
    equipmentDescription: string;
    equipmentTypeDataListItemId: string;
    userGroupId: string;
}>, response: Response): Promise<void>;
