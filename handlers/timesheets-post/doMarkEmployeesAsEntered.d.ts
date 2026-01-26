import type { Request, Response } from 'express';
export type DoMarkEmployeesAsEnteredResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
}>, response: Response<DoMarkEmployeesAsEnteredResponse>): Promise<void>;
