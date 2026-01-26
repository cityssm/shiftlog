import type { Request, Response } from 'express';
export type DoDeleteWorkOrderNoteResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: number | string;
    noteSequence: number | string;
}>, response: Response<DoDeleteWorkOrderNoteResponse>): Promise<void>;
