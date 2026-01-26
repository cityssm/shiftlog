import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import type { Shift } from '../../types/record.types.js';
export type DoGetAvailableShiftsResponse = {
    success: true;
    shifts: Shift[];
};
export default function handler(request: Request<unknown, unknown, {
    supervisorEmployeeNumber?: string;
    shiftDateString?: DateString;
}>, response: Response<DoGetAvailableShiftsResponse>): Promise<void>;
