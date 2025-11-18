import type { DataListItem, Employee, Timesheet } from '../../types/record.types.js';
export interface TimesheetEditResponse {
    headTitle: string;
    isCreate: boolean;
    isEdit: boolean;
    timesheet: Partial<Timesheet>;
    supervisors: Employee[];
    timesheetTypes: DataListItem[];
}
