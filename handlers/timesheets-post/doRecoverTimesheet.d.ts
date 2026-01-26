import type { Request, Response } from 'express';
export type DoRecoverTimesheetResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    message: string;
    redirectUrl: string;
};
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
}>, response: Response<DoRecoverTimesheetResponse>): Promise<void>;
