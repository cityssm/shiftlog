import type { Request, Response } from 'express';
import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js';
export type DoUpdateEmployeeListResponse = {
    employeeLists: Awaited<ReturnType<typeof getEmployeeLists>>;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
    employeeListName: string;
    userGroupId: string;
}>, response: Response<DoUpdateEmployeeListResponse>): Promise<void>;
