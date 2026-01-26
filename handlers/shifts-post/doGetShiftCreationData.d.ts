import type { Request, Response } from 'express';
export type DoGetShiftCreationDataResponse = {
    success: boolean;
    shiftTypes: Array<{
        dataListItemId: number;
        dataListItem: string;
    }>;
    shiftTimes: Array<{
        dataListItemId: number;
        dataListItem: string;
    }>;
    supervisors: Array<{
        employeeNumber: string;
        firstName: string;
        lastName: string;
    }>;
};
export default function handler(request: Request, response: Response<DoGetShiftCreationDataResponse>): Promise<void>;
