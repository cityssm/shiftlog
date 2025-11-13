import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    employeeNumber: string;
    firstName: string;
    lastName: string;
}>, response: Response): Promise<void>;
