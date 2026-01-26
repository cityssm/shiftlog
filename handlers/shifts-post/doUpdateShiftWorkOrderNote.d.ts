import type { Request, Response } from 'express';
export type DoUpdateShiftWorkOrderNoteResponse = {
    success: boolean;
    errorMessage?: string;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    workOrderId: number | string;
    shiftWorkOrderNote: string;
}>, response: Response<DoUpdateShiftWorkOrderNoteResponse>): Promise<void>;
