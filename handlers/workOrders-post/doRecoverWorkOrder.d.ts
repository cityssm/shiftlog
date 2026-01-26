import type { Request, Response } from 'express';
export type DoRecoverWorkOrderResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    message: string;
    redirectUrl: string;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: number | string;
}>, response: Response<DoRecoverWorkOrderResponse>): Promise<void>;
