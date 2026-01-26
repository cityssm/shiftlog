import type { Request, Response } from 'express';
export type DoReopenWorkOrderResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    message: string;
    redirectUrl: string;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: number | string;
}>, response: Response<DoReopenWorkOrderResponse>): Promise<void>;
