import type { DateString } from '@cityssm/utils-datetime';
import type { Shift } from '../../types/record.types.js';
export interface ShiftForBuilder extends Shift {
    crews: Array<{
        crewId: number;
        crewName: string;
        shiftCrewNote: string;
    }>;
    employees: Array<{
        employeeNumber: string;
        firstName: string;
        lastName: string;
        crewId: number | null;
        crewName: string | null;
        isSupervisor: boolean;
        shiftEmployeeNote: string;
    }>;
    equipment: Array<{
        equipmentNumber: string;
        equipmentName: string;
        employeeNumber: string | null;
        employeeFirstName: string | null;
        employeeLastName: string | null;
        shiftEquipmentNote: string;
    }>;
    workOrders: Array<{
        workOrderId: number;
        workOrderNumber: string;
        workOrderDetails: string;
        shiftWorkOrderNote: string;
    }>;
}
export default function getShiftsForBuilder(shiftDateString: DateString, user?: User): Promise<ShiftForBuilder[]>;
