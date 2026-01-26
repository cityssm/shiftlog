import type { Request, Response } from 'express';
export type DoGetShiftCrewsResponse = {
    success: boolean;
    shiftCrews: ShiftCrew[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftCrewsResponse>): Promise<void>;
