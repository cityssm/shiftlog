import type { Request, Response } from 'express';
import type { Crew } from '../../types/record.types.js';
export type DoDeleteCrewResponse = {
    success: boolean;
    message?: string;
    crews?: Crew[];
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
}>, response: Response<DoDeleteCrewResponse>): Promise<void>;
