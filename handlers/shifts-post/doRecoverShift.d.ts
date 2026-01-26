import type { Request, Response } from 'express';
export type DoRecoverShiftResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    message: string;
    redirectUrl: string;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoRecoverShiftResponse>): Promise<void>;
