import type { Request, Response } from 'express';
import type { Crew } from '../../types/record.types.js';
export type DoUpdateCrewResponse = {
    success: boolean;
    message?: string;
    crews?: Crew[];
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    crewName: string;
    userGroupId: string;
}>, response: Response<DoUpdateCrewResponse>): Promise<void>;
