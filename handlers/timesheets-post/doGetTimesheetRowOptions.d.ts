import type { Request, Response } from 'express';
export type DoGetTimesheetRowOptionsResponse = {
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
    jobClassifications: Array<{
        dataListItemId: number;
        dataListItem: string;
    }>;
    timeCodes: Array<{
        dataListItemId: number;
        dataListItem: string;
    }>;
};
export default function handler(request: Request, response: Response<DoGetTimesheetRowOptionsResponse>): Promise<void>;
