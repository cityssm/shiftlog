import type { Request, Response } from 'express';
export type DoGetEligibleEmployeesForEquipmentResponse = {
    success: boolean;
    message?: string;
    employees?: Employee[];
};
export default function handler(request: Request, response: Response<DoGetEligibleEmployeesForEquipmentResponse>): Promise<void>;
