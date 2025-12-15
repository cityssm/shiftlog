import type { DateString } from '@cityssm/utils-datetime';
import type { Shift } from '../../types/record.types.js';
export interface GetPreviousShiftsFilters {
    currentShiftId: number | string;
    shiftDateString?: '' | DateString;
    shiftTimeDataListItemId?: number | string;
    shiftTypeDataListItemId?: number | string;
    supervisorEmployeeNumber?: string;
}
export default function getPreviousShifts(filters: GetPreviousShiftsFilters, user: User): Promise<Shift[]>;
