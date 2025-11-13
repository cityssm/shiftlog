import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    employeeNumber: string;
}>, response: Response): Promise<void>;
