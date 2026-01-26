import type { Request, Response } from 'express';
export type DoGetAvailableCrewsEmployeesEquipmentResponse = {
    success: boolean;
    crews: Crew[];
    employees: Employee[];
    equipment: Equipment[];
};
export default function handler(request: Request, response: Response<DoGetAvailableCrewsEmployeesEquipmentResponse>): Promise<void>;
