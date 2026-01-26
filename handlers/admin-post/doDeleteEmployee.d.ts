import type { Request, Response } from 'express';
import type { Employee } from '../../types/record.types.js';
export type DoDeleteEmployeeResponse = {
    employees: Employee[];
    message: string;
    success: true;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    employeeNumber: string;
}>, response: Response<DoDeleteEmployeeResponse>): Promise<void>;
