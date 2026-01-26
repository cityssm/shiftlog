import type { Request, Response } from 'express';
export type DoAddShiftEmployeeResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoAddShiftEmployeeResponse>): Promise<void>;
