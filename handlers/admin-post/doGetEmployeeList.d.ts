import type { Request, Response } from 'express';
import { type EmployeeListWithMembers } from '../../database/employeeLists/getEmployeeList.js';
export type DoGetEmployeeListResponse = {
    employeeList: EmployeeListWithMembers | undefined;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
}>, response: Response<DoGetEmployeeListResponse>): Promise<void>;
