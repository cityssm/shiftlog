import type { Request, Response } from 'express';
import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js';
export type DoAddEmployeeListResponse = {
    employeeListId: number | undefined;
    employeeLists: Awaited<ReturnType<typeof getEmployeeLists>>;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListName: string;
    userGroupId: string;
}>, response: Response<DoAddEmployeeListResponse>): Promise<void>;
