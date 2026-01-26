import type { Request, Response } from 'express';
import getEmployees from '../../database/employees/getEmployees.js';
export type DoDeleteEmployeeResponse = {
    employees: Awaited<ReturnType<typeof getEmployees>>;
    message: string;
    success: true;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    employeeNumber: string;
}>, response: Response<DoDeleteEmployeeResponse>): Promise<void>;
