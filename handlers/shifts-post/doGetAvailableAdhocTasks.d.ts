import type { Request, Response } from 'express';
import getAvailableAdhocTasks from '../../database/adhocTasks/getAvailableAdhocTasks.js';
export type DoGetAvailableAdhocTasksResponse = {
    success: boolean;
    adhocTasks: Awaited<ReturnType<typeof getAvailableAdhocTasks>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId?: number | string;
}>, response: Response<DoGetAvailableAdhocTasksResponse>): Promise<void>;
