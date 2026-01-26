import type { Request, Response } from 'express';
import getEmployees from '../../database/employees/getEmployees.js';
export type DoAddEmployeeResponse = {
    employees: Awaited<ReturnType<typeof getEmployees>>;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeNumber: string;
    firstName: string;
    lastName: string;
}>, response: Response<DoAddEmployeeResponse>): Promise<void>;
