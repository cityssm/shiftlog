import type { Request, Response } from 'express';
import type { Crew, Employee, Equipment } from '../../types/record.types.js';
export type DoGetAvailableCrewsEmployeesEquipmentResponse = {
    success: true;
    crews: Crew[];
    employees: Employee[];
    equipment: Equipment[];
};
export default function handler(request: Request, response: Response<DoGetAvailableCrewsEmployeesEquipmentResponse>): Promise<void>;
