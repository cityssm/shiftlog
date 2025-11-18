export interface ReorderTimesheetColumnsForm {
    timesheetId: number | string;
    timesheetColumnIds: Array<number | string>;
}
export default function reorderTimesheetColumns(reorderForm: ReorderTimesheetColumnsForm): Promise<boolean>;
