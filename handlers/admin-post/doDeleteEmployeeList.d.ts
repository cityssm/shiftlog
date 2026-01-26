import type { Request, Response } from 'express';
import type { EmployeeList } from '../../types/record.types.js';
export type DoDeleteEmployeeListResponse = {
    employeeLists: EmployeeList[];
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
}>, response: Response<DoDeleteEmployeeListResponse>): Promise<void>;
