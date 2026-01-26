import type { Request, Response } from 'express';
export type DoDeleteWorkOrderResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    redirectUrl: string;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: number | string;
}>, response: Response<DoDeleteWorkOrderResponse>): Promise<void>;
