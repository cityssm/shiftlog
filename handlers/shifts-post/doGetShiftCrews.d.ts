import type { Request, Response } from 'express';
import getShiftCrews from '../../database/shifts/getShiftCrews.js';
export type DoGetShiftCrewsResponse = {
    success: boolean;
    shiftCrews: Awaited<ReturnType<typeof getShiftCrews>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftCrewsResponse>): Promise<void>;
