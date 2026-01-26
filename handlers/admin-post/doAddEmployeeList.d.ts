import type { Request, Response } from 'express';
import type { EmployeeList } from '../../types/record.types.js';
export type DoAddEmployeeListResponse = {
    employeeListId: number | undefined;
    employeeLists: EmployeeList[];
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListName: string;
    userGroupId: string;
}>, response: Response<DoAddEmployeeListResponse>): Promise<void>;
