import type { Employee } from '../../types/record.types.js';
interface GetEmployeesFilters {
    employeeNumber?: string;
    isSupervisor?: boolean;
    includeDeleted?: boolean;
}
declare const orderByOptions: {
    employeeNumber: string;
    name: string;
};
export default function getEmployees(filters?: GetEmployeesFilters, orderBy?: keyof typeof orderByOptions): Promise<Employee[]>;
export {};
