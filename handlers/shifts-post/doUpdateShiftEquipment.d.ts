import type { Request, Response } from 'express';
export type DoUpdateShiftEquipmentResponse = {
    success: boolean;
    message?: string;
};
export default function handler(request: Request, response: Response<DoUpdateShiftEquipmentResponse>): Promise<void>;
