import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    employeeListId: string;
    employeeListName: string;
    userGroupId: string;
}>, response: Response): Promise<void>;
