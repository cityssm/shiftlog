import type { DateString } from '@cityssm/utils-datetime';
export interface AvailableEmployee {
    employeeNumber: string;
    firstName: string;
    lastName: string;
}
export declare function getAvailableEmployees(shiftDateString: DateString): Promise<AvailableEmployee[]>;
export default getAvailableEmployees;
