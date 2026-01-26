import type { Request, Response } from 'express';
import getCrew from '../../database/crews/getCrew.js';
export type DoDeleteCrewMemberResponse = {
    success: boolean;
    message?: string;
    crew?: Awaited<ReturnType<typeof getCrew>>;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    employeeNumber: string;
}>, response: Response<DoDeleteCrewMemberResponse>): Promise<void>;
