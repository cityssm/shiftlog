import type { Request, Response } from 'express';
import getCrews from '../../database/crews/getCrews.js';
export type DoAddCrewResponse = {
    success: boolean;
    crewId?: number;
    crews: Awaited<ReturnType<typeof getCrews>>;
};
export default function handler(request: Request<unknown, unknown, {
    crewName: string;
    userGroupId: string;
}>, response: Response<DoAddCrewResponse>): Promise<void>;
