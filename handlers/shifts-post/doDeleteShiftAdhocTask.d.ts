import type { Request, Response } from 'express';
export type DoDeleteShiftAdhocTaskResponse = {
    success: boolean;
    errorMessage?: string;
    shiftAdhocTasks?: ShiftAdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    adhocTaskId: number | string;
    deleteTask: boolean;
}>, response: Response<DoDeleteShiftAdhocTaskResponse>): Promise<void>;
