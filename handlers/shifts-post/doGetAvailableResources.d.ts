import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import { type AvailableCrew } from '../../database/shifts/getAvailableCrews.js';
import { type AvailableEmployee } from '../../database/shifts/getAvailableEmployees.js';
import { type AvailableEquipment } from '../../database/shifts/getAvailableEquipment.js';
export type DoGetAvailableResourcesResponse = {
    crews: AvailableCrew[];
    employees: AvailableEmployee[];
    equipment: AvailableEquipment[];
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    shiftDateString: DateString;
}>, response: Response<DoGetAvailableResourcesResponse>): Promise<void>;
