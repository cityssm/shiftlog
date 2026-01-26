import type { Request, Response } from 'express';
import type { Timesheet } from '../../types/record.types.js';
export type DoGetDeletedTimesheetsResponse = {
    success: boolean;
    timesheets: Timesheet[];
};
export default function handler(request: Request, response: Response<DoGetDeletedTimesheetsResponse>): Promise<void>;
