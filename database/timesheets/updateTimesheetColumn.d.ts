export interface UpdateTimesheetColumnForm {
    timesheetColumnId: number | string;
    columnTitle: string;
    workOrderNumber?: string;
    costCenterA?: string;
    costCenterB?: string;
}
export default function updateTimesheetColumn(updateColumnForm: UpdateTimesheetColumnForm): Promise<boolean>;
