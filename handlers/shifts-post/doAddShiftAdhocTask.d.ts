import type { Request, Response } from 'express';
import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
export type DoAddShiftAdhocTaskResponse = {
    success: boolean;
    errorMessage?: string;
    shiftAdhocTasks?: Awaited<ReturnType<typeof getShiftAdhocTasks>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    adhocTaskId: number | string;
    shiftAdhocTaskNote: string;
}>, response: Response<DoAddShiftAdhocTaskResponse>): Promise<void>;
