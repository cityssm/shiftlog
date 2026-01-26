import type { Request, Response } from 'express';
export type DoDeleteTimesheetColumnResponse = {
    success: boolean;
    totalHours?: number;
};
export default function handler(request: Request<unknown, unknown, {
    timesheetColumnId: number | string;
}>, response: Response<DoDeleteTimesheetColumnResponse>): Promise<void>;
