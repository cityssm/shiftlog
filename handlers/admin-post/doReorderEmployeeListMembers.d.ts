import type { Request, Response } from 'express';
import { type EmployeeListWithMembers } from '../../database/employeeLists/getEmployeeList.js';
import { type ReorderEmployeeListMembersForm } from '../../database/employeeLists/reorderEmployeeListMembers.js';
export type DoReorderEmployeeListMembersResponse = {
    employeeList: EmployeeListWithMembers | undefined;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, ReorderEmployeeListMembersForm>, response: Response<DoReorderEmployeeListMembersResponse>): Promise<void>;
