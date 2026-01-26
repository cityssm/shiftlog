import type { Request, Response } from 'express';
import getCrews from '../../database/crews/getCrews.js';
export type DoDeleteCrewResponse = {
    success: boolean;
    message?: string;
    crews?: Awaited<ReturnType<typeof getCrews>>;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
}>, response: Response<DoDeleteCrewResponse>): Promise<void>;
