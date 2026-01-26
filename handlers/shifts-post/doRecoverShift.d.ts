import type { Request, Response } from 'express';
export type DoRecoverShiftResponse = {
    success: boolean;
    errorMessage?: string;
    message?: string;
    redirectUrl?: string;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoRecoverShiftResponse>): Promise<void>;
