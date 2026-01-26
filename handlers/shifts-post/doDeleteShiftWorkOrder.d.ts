import type { Request, Response } from 'express';
import { type ShiftWorkOrder } from '../../database/shifts/getShiftWorkOrders.js';
export type DoDeleteShiftWorkOrderResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    shiftWorkOrders: ShiftWorkOrder[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    workOrderId: number | string;
}>, response: Response<DoDeleteShiftWorkOrderResponse>): Promise<void>;
