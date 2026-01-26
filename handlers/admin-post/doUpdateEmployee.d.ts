import type { Request, Response } from 'express';
import type { Employee } from '../../types/record.types.js';
export type DoUpdateEmployeeResponse = {
    message: string;
    success: false;
} | {
    message: string;
    success: true;
    employees: Employee[];
};
export default function handler(request: Request, response: Response<DoUpdateEmployeeResponse>): Promise<void>;
