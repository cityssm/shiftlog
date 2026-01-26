import type { Request, Response } from 'express';
import { type CrewWithDetails } from '../../database/crews/getCrew.js';
export type DoUpdateCrewEquipmentResponse = {
    success: boolean;
    message?: string;
    crew?: CrewWithDetails;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    equipmentNumber: string;
    employeeNumber: string;
}>, response: Response<DoUpdateCrewEquipmentResponse>): Promise<void>;
