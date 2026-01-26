import type { Request, Response } from 'express';
import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
export type DoDeleteShiftAdhocTaskResponse = {
    success: boolean;
    errorMessage?: string;
    shiftAdhocTasks?: Awaited<ReturnType<typeof getShiftAdhocTasks>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    adhocTaskId: number | string;
    deleteTask: boolean;
}>, response: Response<DoDeleteShiftAdhocTaskResponse>): Promise<void>;
