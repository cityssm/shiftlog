import type { Request, Response } from 'express';
export type DoAddShiftCrewResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoAddShiftCrewResponse>): Promise<void>;
