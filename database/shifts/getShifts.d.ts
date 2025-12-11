import type { DateString } from '@cityssm/utils-datetime';
import type { Shift } from '../../types/record.types.js';
export interface GetShiftsFilters {
    shiftDateString?: '' | DateString;
    shiftTypeDataListItemId?: number | string;
    supervisorEmployeeNumber?: string;
}
export interface GetShiftsOptions {
    limit: number | string;
    offset: number | string;
}
export default function getShifts(filters: GetShiftsFilters, options: GetShiftsOptions, user?: User): Promise<{
    shifts: Shift[];
    totalCount: number;
}>;
