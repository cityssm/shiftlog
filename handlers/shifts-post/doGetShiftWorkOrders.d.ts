import type { Request, Response } from 'express';
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js';
export type DoGetShiftWorkOrdersResponse = {
    success: boolean;
    shiftWorkOrders: Awaited<ReturnType<typeof getShiftWorkOrders>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftWorkOrdersResponse>): Promise<void>;
