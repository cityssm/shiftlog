import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
export interface DoGetAvailableResourcesResponse {
    crews: Array<{
        crewId: number;
        crewName: string;
    }>;
    employees: Array<{
        employeeNumber: string;
        firstName: string;
        lastName: string;
    }>;
    equipment: Array<{
        equipmentName: string;
        equipmentNumber: string;
    }>;
    success: boolean;
}
export default function handler(request: Request<unknown, unknown, {
    shiftDateString: DateString;
}>, response: Response<DoGetAvailableResourcesResponse>): Promise<void>;
