import type { Request, Response } from 'express';
import type { ShiftCrew } from '../../types/record.types.js';
export type DoGetShiftCrewsResponse = {
    success: true;
    shiftCrews: ShiftCrew[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftCrewsResponse>): Promise<void>;
