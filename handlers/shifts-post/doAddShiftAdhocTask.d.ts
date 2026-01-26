import type { Request, Response } from 'express';
export type DoAddShiftAdhocTaskResponse = {
    success: boolean;
    errorMessage?: string;
    shiftAdhocTasks?: ShiftAdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    adhocTaskId: number | string;
    shiftAdhocTaskNote: string;
}>, response: Response<DoAddShiftAdhocTaskResponse>): Promise<void>;
