import type { DateString } from '@cityssm/utils-datetime';
export interface UpdateTimesheetForm {
    timesheetId: number | string;
    timesheetTypeDataListItemId: number | string;
    supervisorEmployeeNumber: string;
    timesheetDateString: DateString;
    timesheetTitle: string;
    timesheetNote: string;
    shiftId?: number | string | null;
}
export default function updateTimesheet(updateTimesheetForm: UpdateTimesheetForm, userName: string): Promise<boolean>;
