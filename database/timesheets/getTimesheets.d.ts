import type { DateString } from '@cityssm/utils-datetime';
import type { Timesheet } from '../../types/record.types.js';
export interface GetTimesheetsFilters {
    timesheetDateString?: DateString;
    supervisorEmployeeNumber?: string;
    timesheetTypeDataListItemId?: number | string;
}
export interface GetTimesheetsOptions {
    limit: number | string;
    offset: number | string;
}
export default function getTimesheets(filters: GetTimesheetsFilters, options: GetTimesheetsOptions, user?: User): Promise<{
    timesheets: Timesheet[];
    totalCount: number;
}>;
//# sourceMappingURL=getTimesheets.d.ts.map