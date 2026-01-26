import type { Request, Response } from 'express';
export type DoAddCrewEquipmentResponse = {
    success: boolean;
    message?: string;
    crew?: Crew;
};
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    equipmentNumber: string;
    employeeNumber: string;
}>, response: Response<DoAddCrewEquipmentResponse>): Promise<void>;
