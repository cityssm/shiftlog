import type { Request, Response } from 'express';
import { type EmployeeListWithMembers } from '../../database/employeeLists/getEmployeeList.js';
export type DoUpdateEmployeeListMemberResponse = {
    employeeList: EmployeeListWithMembers | undefined;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
    employeeNumber: string;
    seniorityDate: string;
    seniorityOrderNumber: string;
}>, response: Response<DoUpdateEmployeeListMemberResponse>): Promise<void>;
