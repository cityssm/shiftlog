import type { Timesheet } from '../../types/record.types.js';
export interface GetDeletedTimesheetsOptions {
    limit: number | string;
    offset: number | string;
}
export default function getDeletedTimesheets(options: GetDeletedTimesheetsOptions, user?: User): Promise<{
    timesheets: Timesheet[];
    totalCount: number;
}>;
