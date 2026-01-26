import type { Request, Response } from 'express';
import getEmployeeList from '../../database/employeeLists/getEmployeeList.js';
export type DoGetEmployeeListResponse = {
    employeeList: Awaited<ReturnType<typeof getEmployeeList>>;
};
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
}>, response: Response<DoGetEmployeeListResponse>): Promise<void>;
