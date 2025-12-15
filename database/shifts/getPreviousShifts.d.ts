import type { DateString } from '@cityssm/utils-datetime';
import type { Shift } from '../../types/record.types.js';
export interface GetPreviousShiftsFilters {
    currentShiftId: number | string;
    shiftTypeDataListItemId?: number | string;
    supervisorEmployeeNumber?: string;
    shiftTimeDataListItemId?: number | string;
    shiftDateString?: '' | DateString;
}
export default function getPreviousShifts(filters: GetPreviousShiftsFilters, user: User): Promise<Shift[]>;
