import type { Request, Response } from 'express';
export type DoCopyFromPreviousTimesheetResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    sourceTimesheetId: number | string;
    targetTimesheetId: number | string;
}>, response: Response<DoCopyFromPreviousTimesheetResponse>): Promise<void>;
