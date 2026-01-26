import type { Request, Response } from 'express';
import getCrews from '../../database/crews/getCrews.js';
import getEmployees from '../../database/employees/getEmployees.js';
import getEquipmentList from '../../database/equipment/getEquipmentList.js';
export type DoGetAvailableCrewsEmployeesEquipmentResponse = {
    success: boolean;
    crews: Awaited<ReturnType<typeof getCrews>>;
    employees: Awaited<ReturnType<typeof getEmployees>>;
    equipment: Awaited<ReturnType<typeof getEquipmentList>>;
};
export default function handler(request: Request, response: Response<DoGetAvailableCrewsEmployeesEquipmentResponse>): Promise<void>;
