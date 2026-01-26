import type { Request, Response } from 'express';
export type DoGetShiftCreationDataResponse = {
    success: boolean;
    shiftTimes: Array<{
        dataListItem: string;
        dataListItemId: number;
    }>;
    shiftTypes: Array<{
        dataListItem: string;
        dataListItemId: number;
    }>;
    supervisors: Array<{
        employeeNumber: string;
        firstName: string;
        lastName: string;
    }>;
};
export default function handler(request: Request, response: Response<DoGetShiftCreationDataResponse>): Promise<void>;
