import type { Request, Response } from 'express';
export type DoDeleteTimesheetRowResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    timesheetRowId: number | string;
}>, response: Response<DoDeleteTimesheetRowResponse>): Promise<void>;
