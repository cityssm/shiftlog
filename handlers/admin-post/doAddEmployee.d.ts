import type { Request, Response } from 'express';
import type { Employee } from '../../types/record.types.js';
export type DoAddEmployeeResponse = {
    success: boolean;
    employees: Employee[];
};
export default function handler(request: Request<unknown, unknown, {
    employeeNumber: string;
    firstName: string;
    lastName: string;
}>, response: Response<DoAddEmployeeResponse>): Promise<void>;
