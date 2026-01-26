import type { Request, Response } from 'express';
import getEmployeeList from '../../database/employeeLists/getEmployeeList.js';
export type DoDeleteEmployeeListMemberResponse = {
    employeeList: Awaited<ReturnType<typeof getEmployeeList>>;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
    employeeNumber: string;
}>, response: Response<DoDeleteEmployeeListMemberResponse>): Promise<void>;
