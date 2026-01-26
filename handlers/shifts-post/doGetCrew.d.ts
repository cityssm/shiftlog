import type { Request, Response } from 'express';
export type DoGetCrewResponse = {
    success: boolean;
    crew?: Crew;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
}>, response: Response<DoGetCrewResponse>): Promise<void>;
