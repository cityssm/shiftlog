import type { Request, Response } from 'express';
import getShiftEmployees from '../../database/shifts/getShiftEmployees.js';
export type DoGetShiftEmployeesResponse = {
    success: boolean;
    shiftEmployees: Awaited<ReturnType<typeof getShiftEmployees>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftEmployeesResponse>): Promise<void>;
