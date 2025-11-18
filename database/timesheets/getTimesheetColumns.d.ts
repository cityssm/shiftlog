import type { TimesheetColumn } from '../../types/record.types.js';
export default function getTimesheetColumns(timesheetId: number | string): Promise<TimesheetColumn[]>;
