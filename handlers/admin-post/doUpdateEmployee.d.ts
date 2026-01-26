import type { Request, Response } from 'express';
import getEmployees from '../../database/employees/getEmployees.js';
export type DoUpdateEmployeeResponse = {
    message: string;
    success: true;
    employees: Awaited<ReturnType<typeof getEmployees>>;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request, response: Response<DoUpdateEmployeeResponse>): Promise<void>;
