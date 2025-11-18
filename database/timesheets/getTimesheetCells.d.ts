import type { TimesheetCell } from '../../types/record.types.js';
export default function getTimesheetCells(timesheetId: number | string): Promise<TimesheetCell[]>;
