import type { Request, Response } from 'express';
import getEmployeeList from '../../database/employeeLists/getEmployeeList.js';
import { type ReorderEmployeeListMembersForm } from '../../database/employeeLists/reorderEmployeeListMembers.js';
export type DoReorderEmployeeListMembersResponse = {
    employeeList: Awaited<ReturnType<typeof getEmployeeList>> | undefined;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, ReorderEmployeeListMembersForm>, response: Response<DoReorderEmployeeListMembersResponse>): Promise<void>;
