import type { DateString } from '@cityssm/utils-datetime';
export interface AvailableEmployee {
    employeeNumber: string;
    firstName: string;
    lastName: string;
    isSupervisor: boolean;
}
export default function getAvailableEmployees(shiftDateString: DateString): Promise<AvailableEmployee[]>;
