import type { Request, Response } from 'express';
export type DoDeleteCrewEquipmentResponse = {
    success: boolean;
    message?: string;
    crew?: Crew;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    equipmentNumber: string;
}>, response: Response<DoDeleteCrewEquipmentResponse>): Promise<void>;
