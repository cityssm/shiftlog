export interface UpdateTimesheetCellForm {
    timesheetRowId: number | string;
    timesheetColumnId: number | string;
    recordHours: number | string;
}
export default function updateTimesheetCell(updateCellForm: UpdateTimesheetCellForm): Promise<boolean>;
