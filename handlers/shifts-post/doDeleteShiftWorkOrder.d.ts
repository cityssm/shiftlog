import type { Request, Response } from 'express';
export type DoDeleteShiftWorkOrderResponse = {
    success: boolean;
    errorMessage?: string;
    shiftWorkOrders?: ShiftWorkOrder[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    workOrderId: number | string;
}>, response: Response<DoDeleteShiftWorkOrderResponse>): Promise<void>;
