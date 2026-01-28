import type { Request, Response } from 'express';
import { type EmployeeContactFields } from '../../database/employees/updateEmployeeContactByUserName.js';
export type DoUpdateEmployeeContactResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, EmployeeContactFields>, response: Response<DoUpdateEmployeeContactResponse>): Promise<void>;
//# sourceMappingURL=doUpdateEmployeeContact.d.ts.map