import type { Timesheet } from '../../types/record.types.js';
export default function getDeletedTimesheets(user?: User): Promise<Timesheet[]>;
