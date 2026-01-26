import type { Request, Response } from 'express';
export type DoMarkTimesheetAsSubmittedResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
}>, response: Response<DoMarkTimesheetAsSubmittedResponse>): Promise<void>;
