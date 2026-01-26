import type { Request, Response } from 'express';
export type DoDeleteShiftCrewResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoDeleteShiftCrewResponse>): Promise<void>;
