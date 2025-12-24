import type { Timesheet } from '../../types/record.types.js';
export default function getTimesheetsByShift(shiftId: number | string, user?: User): Promise<Timesheet[]>;
