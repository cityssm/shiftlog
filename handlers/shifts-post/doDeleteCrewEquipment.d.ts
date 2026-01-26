import type { Request, Response } from 'express';
import { type CrewWithDetails } from '../../database/crews/getCrew.js';
export type DoDeleteCrewEquipmentResponse = {
    success: boolean;
    message?: string;
    crew?: CrewWithDetails;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    equipmentNumber: string;
}>, response: Response<DoDeleteCrewEquipmentResponse>): Promise<void>;
