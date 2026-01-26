import type { Request, Response } from 'express';
export type DoAddShiftWorkOrderResponse = {
    success: boolean;
    errorMessage?: string;
    shiftWorkOrders?: ShiftWorkOrder[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    workOrderId: number | string;
    shiftWorkOrderNote: string;
}>, response: Response<DoAddShiftWorkOrderResponse>): Promise<void>;
