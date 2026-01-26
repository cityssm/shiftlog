import type { Request, Response } from 'express';
export type DoGetShiftAdhocTasksResponse = {
    success: boolean;
    shiftAdhocTasks: ShiftAdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftAdhocTasksResponse>): Promise<void>;
