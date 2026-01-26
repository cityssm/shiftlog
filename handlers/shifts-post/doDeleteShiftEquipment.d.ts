import type { Request, Response } from 'express';
export type DoDeleteShiftEquipmentResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoDeleteShiftEquipmentResponse>): Promise<void>;
