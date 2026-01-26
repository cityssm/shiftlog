import type { Request, Response } from 'express';
import getCrew from '../../database/crews/getCrew.js';
export type DoGetCrewResponse = {
    success: boolean;
    crew?: Awaited<ReturnType<typeof getCrew>>;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
}>, response: Response<DoGetCrewResponse>): Promise<void>;
