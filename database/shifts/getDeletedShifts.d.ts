import type { Shift } from '../../types/record.types.js';
export interface GetDeletedShiftsOptions {
    limit: number | string;
    offset: number | string;
}
export default function getDeletedShifts(options: GetDeletedShiftsOptions, user?: User): Promise<{
    shifts: Shift[];
    totalCount: number;
}>;
