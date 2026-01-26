import type { Request, Response } from 'express';
export type DoAddShiftEquipmentResponse = {
    success: boolean;
    message?: string;
};
export default function handler(request: Request, response: Response<DoAddShiftEquipmentResponse>): Promise<void>;
