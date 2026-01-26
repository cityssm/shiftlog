import type { Request, Response } from 'express';
export type DoAddCrewResponse = {
    success: boolean;
    crewId?: number;
    crews: Crew[];
};
export default function handler(request: Request<unknown, unknown, {
    crewName: string;
    userGroupId: string;
}>, response: Response<DoAddCrewResponse>): Promise<void>;
