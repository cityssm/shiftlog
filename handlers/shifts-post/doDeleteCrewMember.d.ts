import type { Request, Response } from 'express';
export type DoDeleteCrewMemberResponse = {
    success: boolean;
    message?: string;
    crew?: Crew;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    employeeNumber: string;
}>, response: Response<DoDeleteCrewMemberResponse>): Promise<void>;
