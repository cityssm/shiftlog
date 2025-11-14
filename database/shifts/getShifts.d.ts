import type { DateString } from '@cityssm/utils-datetime';
import type { Shift } from '../../types/record.types.js';
interface GetShiftFilters {
    shiftDateString?: DateString;
}
export default function getShifts(filters: GetShiftFilters, user?: User): Promise<Shift[]>;
export {};
