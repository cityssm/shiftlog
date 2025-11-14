import type { DataListItem, Employee, Shift } from '../../types/record.types.js';
export interface ShiftEditResponse {
    headTitle: string;
    isCreate: boolean;
    isEdit: boolean;
    shift: Partial<Shift>;
    shiftTimes: DataListItem[];
    shiftTypes: DataListItem[];
    supervisors: Employee[];
}
