import type { Request, Response } from 'express';
export type DoGetShiftWorkOrdersResponse = {
    success: boolean;
    shiftWorkOrders: ShiftWorkOrder[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoGetShiftWorkOrdersResponse>): Promise<void>;
