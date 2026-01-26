import type { Request, Response } from 'express';
import { type ShiftWorkOrder } from '../../database/shifts/getShiftWorkOrders.js';
export type DoGetShiftWorkOrdersResponse = {
    success: true;
    shiftWorkOrders: ShiftWorkOrder[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftWorkOrdersResponse>): Promise<void>;
