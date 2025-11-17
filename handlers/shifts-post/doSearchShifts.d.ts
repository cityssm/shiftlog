import type { Request, Response } from 'express';
import { type GetShiftsFilters, type GetShiftsOptions } from '../../database/shifts/getShifts.js';
import type { Shift } from '../../types/record.types.js';
export interface DoSearchShiftsResponse {
    success: boolean;
    shifts: Shift[];
    totalCount: number;
    limit: number;
    offset: number;
}
export default function handler(request: Request<unknown, unknown, GetShiftsFilters & GetShiftsOptions>, response: Response<DoSearchShiftsResponse>): Promise<void>;
