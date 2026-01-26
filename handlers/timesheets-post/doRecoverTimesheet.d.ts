import type { Request, Response } from 'express';
export type DoRecoverTimesheetResponse = {
    success: true;
    message: string;
    redirectUrl: string;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
}>, response: Response<DoRecoverTimesheetResponse>): Promise<void>;
