import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    employeeNumber: string;
}>, response: Response): Promise<void>;
