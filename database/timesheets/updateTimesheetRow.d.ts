export interface UpdateTimesheetRowForm {
    timesheetRowId: number | string;
    rowTitle: string;
    jobClassificationDataListItemId?: number | string | null;
    timeCodeDataListItemId?: number | string | null;
}
export default function updateTimesheetRow(updateRowForm: UpdateTimesheetRowForm): Promise<boolean>;
