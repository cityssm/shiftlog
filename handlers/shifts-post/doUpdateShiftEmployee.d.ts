import type { Request, Response } from 'express';
export type DoUpdateShiftEmployeeResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoUpdateShiftEmployeeResponse>): Promise<void>;
