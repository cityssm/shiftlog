import type { Request, Response } from 'express';
export type DoGetAvailableAdhocTasksResponse = {
    success: boolean;
    adhocTasks: AdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId?: number | string;
}>, response: Response<DoGetAvailableAdhocTasksResponse>): Promise<void>;
