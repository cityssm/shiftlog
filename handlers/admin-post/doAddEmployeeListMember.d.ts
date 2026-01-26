import type { Request, Response } from 'express';
import getEmployeeList from '../../database/employeeLists/getEmployeeList.js';
export type DoAddEmployeeListMemberResponse = {
    employeeList: Awaited<ReturnType<typeof getEmployeeList>>;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
    employeeNumber: string;
    seniorityDate: string;
    seniorityOrderNumber: string;
}>, response: Response<DoAddEmployeeListMemberResponse>): Promise<void>;
