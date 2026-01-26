import type { Request, Response } from 'express';
import getEmployees from '../../database/employees/getEmployees.js';
export type DoGetEligibleEmployeesForEquipmentResponse = {
    success: boolean;
    message?: string;
    employees?: Awaited<ReturnType<typeof getEmployees>>;
};
export default function handler(request: Request, response: Response<DoGetEligibleEmployeesForEquipmentResponse>): Promise<void>;
