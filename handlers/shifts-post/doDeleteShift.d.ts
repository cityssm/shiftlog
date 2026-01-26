import type { Request, Response } from 'express';
export type DoDeleteShiftResponse = {
    success: boolean;
    errorMessage?: string;
    redirectUrl?: string;
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
}>, response: Response<DoDeleteShiftResponse>): Promise<void>;
