import type { DataListItem, Employee, Shift, ShiftCrew, ShiftEmployee, ShiftEquipment } from '../../types/record.types.js';
export interface ShiftEditResponse {
    headTitle: string;
    isCreate: boolean;
    isEdit: boolean;
    shift: Partial<Shift>;
    shiftCrews: ShiftCrew[];
    shiftEmployees: ShiftEmployee[];
    shiftEquipment: ShiftEquipment[];
    shiftTimes: DataListItem[];
    shiftTypes: DataListItem[];
    supervisors: Employee[];
}
