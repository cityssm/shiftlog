import type { Request, Response } from 'express';
import { type EmployeeListWithMembers } from '../../database/employeeLists/getEmployeeList.js';
export type DoDeleteEmployeeListMemberResponse = {
    employeeList: EmployeeListWithMembers | undefined;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
    employeeNumber: string;
}>, response: Response<DoDeleteEmployeeListMemberResponse>): Promise<void>;
