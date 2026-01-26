import type { Request, Response } from 'express';
export type DoRecoverWorkOrderResponse = {
    success: boolean;
    message?: string;
    redirectUrl?: string;
    errorMessage?: string;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: number | string;
}>, response: Response<DoRecoverWorkOrderResponse>): Promise<void>;
