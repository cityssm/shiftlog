import type { Request, Response } from 'express';
export type DoDeleteShiftEmployeeResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoDeleteShiftEmployeeResponse>): Promise<void>;
