import type { Request, Response } from 'express';
import type { AdhocTask } from '../../types/record.types.js';
export type DoGetShiftAdhocTasksResponse = {
    success: true;
    shiftAdhocTasks: AdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftAdhocTasksResponse>): Promise<void>;
