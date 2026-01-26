import type { Request, Response } from 'express';
export type DoDeleteWorkOrderResponse = {
    success: boolean;
    redirectUrl?: string;
    errorMessage?: string;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: number | string;
}>, response: Response<DoDeleteWorkOrderResponse>): Promise<void>;
