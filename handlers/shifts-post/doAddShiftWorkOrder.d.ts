import type { Request, Response } from 'express';
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js';
export type DoAddShiftWorkOrderResponse = {
    success: boolean;
    errorMessage?: string;
    shiftWorkOrders?: Awaited<ReturnType<typeof getShiftWorkOrders>>;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    workOrderId: number | string;
    shiftWorkOrderNote: string;
}>, response: Response<DoAddShiftWorkOrderResponse>): Promise<void>;
