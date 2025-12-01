import type { DataListItem, Employee, Shift, ShiftCrew, ShiftEmployee, ShiftEquipment } from '../../types/record.types.js';
import type { ShiftWorkOrder } from '../../database/shifts/getShiftWorkOrders.js';
export interface ShiftEditResponse {
    headTitle: string;
    isCreate: boolean;
    isEdit: boolean;
    shift: Partial<Shift>;
    shiftCrews: ShiftCrew[];
    shiftEmployees: ShiftEmployee[];
    shiftEquipment: ShiftEquipment[];
    shiftWorkOrders: ShiftWorkOrder[];
    shiftTimes: DataListItem[];
    shiftTypes: DataListItem[];
    supervisors: Employee[];
}
