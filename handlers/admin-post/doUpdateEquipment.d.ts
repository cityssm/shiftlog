import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    equipmentDescription: string;
    equipmentName: string;
    equipmentNumber: string;
    equipmentTypeDataListItemId: string;
    userGroupId: string;
}>, response: Response): Promise<void>;
