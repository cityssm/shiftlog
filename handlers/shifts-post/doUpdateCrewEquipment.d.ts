import type { Request, Response } from 'express';
export type DoUpdateCrewEquipmentResponse = {
    success: boolean;
    message?: string;
    crew?: Crew;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    equipmentNumber: string;
    employeeNumber: string;
}>, response: Response<DoUpdateCrewEquipmentResponse>): Promise<void>;
