export interface AddTimesheetColumnForm {
    timesheetId: number | string;
    columnTitle: string;
    workOrderNumber?: string;
    costCenterA?: string;
    costCenterB?: string;
}
export default function addTimesheetColumn(addColumnForm: AddTimesheetColumnForm): Promise<number>;
