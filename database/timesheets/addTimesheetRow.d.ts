export interface AddTimesheetRowForm {
    timesheetId: number | string;
    rowTitle: string;
    employeeNumber?: string | null;
    equipmentNumber?: string | null;
    jobClassificationDataListItemId?: number | string | null;
    timeCodeDataListItemId?: number | string | null;
}
export default function addTimesheetRow(addRowForm: AddTimesheetRowForm): Promise<number>;
