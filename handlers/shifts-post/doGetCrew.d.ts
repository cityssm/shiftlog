import type { Request, Response } from 'express';
import { type CrewWithDetails } from '../../database/crews/getCrew.js';
export type DoGetCrewResponse = {
    success: false;
} | {
    success: true;
    crew: CrewWithDetails;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
}>, response: Response<DoGetCrewResponse>): Promise<void>;
