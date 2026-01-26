import type { Request, Response } from 'express';
import { type UpdateShiftEmployeeForm } from '../../database/shifts/updateShiftEmployee.js';
export type DoUpdateShiftEmployeeResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, UpdateShiftEmployeeForm>, response: Response<DoUpdateShiftEmployeeResponse>): Promise<void>;
