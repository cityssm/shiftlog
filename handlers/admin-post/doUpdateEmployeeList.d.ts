import type { Request, Response } from 'express';
import type { EmployeeList } from '../../types/record.types.js';
export type DoUpdateEmployeeListResponse = {
    employeeLists: EmployeeList[];
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
    employeeListName: string;
    userGroupId: string;
}>, response: Response<DoUpdateEmployeeListResponse>): Promise<void>;
