import type { Request, Response } from 'express';
import type { AdhocTask } from '../../types/record.types.js';
export type DoGetAvailableAdhocTasksResponse = {
    success: true;
    adhocTasks: AdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId?: number | string;
}>, response: Response<DoGetAvailableAdhocTasksResponse>): Promise<void>;
