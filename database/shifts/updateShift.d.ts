import type { DateString } from '@cityssm/utils-datetime';
export interface UpdateShiftForm {
    shiftId: number | string;
    shiftTypeDataListItemId: number | string;
    supervisorEmployeeNumber: string;
    shiftDateString: DateString;
    shiftTimeDataListItemId: number | string;
    shiftDescription: string;
}
export default function updateShift(updateShiftForm: UpdateShiftForm, userName: string): Promise<boolean>;
