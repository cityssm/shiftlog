export interface DeleteTimesheetColumnResult {
    success: boolean;
    totalHours?: number;
}
export default function deleteTimesheetColumn(timesheetColumnId: number | string): Promise<DeleteTimesheetColumnResult>;
