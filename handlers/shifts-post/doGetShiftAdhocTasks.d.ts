import type { Request, Response } from 'express';
import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js';
export type DoGetShiftAdhocTasksResponse = {
    success: boolean;
    shiftAdhocTasks: Awaited<ReturnType<typeof getShiftAdhocTasks>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftAdhocTasksResponse>): Promise<void>;
