import type { Request, Response } from 'express';
import type { DateString } from '@cityssm/utils-datetime';
import { type ShiftForBuilder } from '../../database/shifts/getShiftsForBuilder.js';
export interface DoGetShiftsForBuilderResponse {
    success: boolean;
    shifts: ShiftForBuilder[];
}
export default function handler(request: Request<unknown, unknown, {
    shiftDateString: DateString;
}, unknown>, response: Response<DoGetShiftsForBuilderResponse>): Promise<void>;
