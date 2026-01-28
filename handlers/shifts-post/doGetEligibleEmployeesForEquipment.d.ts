import type { Request, Response } from 'express';
import type { Employee } from '../../types/record.types.js';
export type DoGetEligibleEmployeesForEquipmentResponse = {
    success: false;
    message: string;
} | {
    success: true;
    employees: Employee[];
};
export default function handler(request: Request, response: Response<DoGetEligibleEmployeesForEquipmentResponse>): Promise<void>;
