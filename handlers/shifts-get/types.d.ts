import type { ShiftWorkOrder } from '../../database/shifts/getShiftWorkOrders.js';
import type { AdhocTask, DataListItem, Employee, Shift, ShiftCrew, ShiftEmployee, ShiftEquipment, Timesheet } from '../../types/record.types.js';
export interface ShiftEditResponse {
    headTitle: string;
    section: 'shifts';
    isCreate: boolean;
    isEdit: boolean;
    shift: Partial<Shift>;
    shiftCrews: ShiftCrew[];
    shiftEmployees: ShiftEmployee[];
    shiftEquipment: ShiftEquipment[];
    shiftAdhocTasks: AdhocTask[];
    shiftWorkOrders: ShiftWorkOrder[];
    shiftTimesheets: Timesheet[];
    shiftTimes: DataListItem[];
    shiftTypes: DataListItem[];
    supervisors: Employee[];
}
