import type { Request, Response } from 'express';
import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js';
export type DoDeleteEmployeeListResponse = {
    employeeLists: Awaited<ReturnType<typeof getEmployeeLists>>;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
}>, response: Response<DoDeleteEmployeeListResponse>): Promise<void>;
