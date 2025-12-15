import type { Request, Response } from 'express';
import type { DateString } from '@cityssm/utils-datetime';
export interface DoGetAvailableResourcesResponse {
    success: boolean;
    employees: Array<{
        employeeNumber: string;
        firstName: string;
        lastName: string;
    }>;
    equipment: Array<{
        equipmentNumber: string;
        equipmentName: string;
    }>;
    crews: Array<{
        crewId: number;
        crewName: string;
    }>;
}
export default function handler(request: Request<unknown, unknown, {
    shiftDateString: DateString;
}>, response: Response<DoGetAvailableResourcesResponse>): Promise<void>;
