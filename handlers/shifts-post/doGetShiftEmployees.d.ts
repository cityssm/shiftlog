import type { Request, Response } from 'express';
export type DoGetShiftEmployeesResponse = {
    success: boolean;
    shiftEmployees: ShiftEmployee[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftEmployeesResponse>): Promise<void>;
