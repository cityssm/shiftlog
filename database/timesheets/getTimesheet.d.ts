import type { Timesheet } from '../../types/record.types.js';
export default function getTimesheet(timesheetId: number | string, user?: User): Promise<Timesheet | undefined>;
