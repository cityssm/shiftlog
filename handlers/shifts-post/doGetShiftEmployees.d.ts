import type { Request, Response } from 'express';
import type { ShiftEmployee } from '../../types/record.types.js';
export type DoGetShiftEmployeesResponse = {
    success: true;
    shiftEmployees: ShiftEmployee[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftEmployeesResponse>): Promise<void>;
