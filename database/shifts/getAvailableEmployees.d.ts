import type { DateString } from '@cityssm/utils-datetime';
export interface AvailableEmployee {
    employeeNumber: string;
    firstName: string;
    lastName: string;
}
export default function getAvailableEmployees(shiftDateString: DateString): Promise<AvailableEmployee[]>;
