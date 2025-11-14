import type { DateString } from '@cityssm/utils-datetime';
export interface CreateShiftForm {
    shiftTypeDataListItemId: number | string;
    supervisorEmployeeNumber: string;
    shiftDateString: DateString;
    shiftTimeDataListItemId: number | string;
    shiftDescription: string;
}
export default function createShift(createShiftForm: CreateShiftForm, userName: string): Promise<number>;
