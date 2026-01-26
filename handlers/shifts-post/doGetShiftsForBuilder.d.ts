import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import { type ShiftForBuilder } from '../../database/shifts/getShiftsForBuilder.js';
export type DoGetShiftsForBuilderResponse = {
    success: boolean;
    shifts: ShiftForBuilder[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftDateString: DateString;
}, unknown>, response: Response<DoGetShiftsForBuilderResponse>): Promise<void>;
