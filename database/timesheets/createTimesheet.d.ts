import type { DateString } from '@cityssm/utils-datetime';
export interface CreateTimesheetForm {
    timesheetTypeDataListItemId: number | string;
    supervisorEmployeeNumber: string;
    timesheetDateString: DateString;
    timesheetTitle: string;
    timesheetNote: string;
    shiftId?: number | string | null;
}
export default function createTimesheet(createTimesheetForm: CreateTimesheetForm, userName: string): Promise<number>;
